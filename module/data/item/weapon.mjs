import PhysicalItemTemplate from "./templates/physical-item.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import { filterObject, inRange, sum } from "../../utils.mjs";
import ED4E from "../../config/_module.mjs";
import RollPrompt from "../../applications/global/roll-prompt.mjs";
import DamageRollOptions from "../roll/damage.mjs";
import RollableTemplate from "./templates/rollable.mjs";
import RollProcessor from "../../services/roll-processor.mjs";

/**
 * Data model template with information on weapon items.
 * @property {string} weaponType      type of weapon
 * @property {object} damage        damage object
 * @property {string} damage.attribute     base attribute used for damage
 * @property {number} damage.baseStep    weapon basic damage step
 * @property {number} size          weapon size 1-7
 * @property {number} strengthMinimum     strength minimum to use without penalty
 * @property {number} dexterityMinimum    dexterity minimum to use without penalty
 * @property {number} rangeShort      short range
 * @property {number} rangeLong       long range
 * @property {number} ammunition      ammunition amount
 * @property {number} forgeBonus      forged damage bonus
 */
export default class WeaponData extends PhysicalItemTemplate.mixin(
  ItemDescriptionTemplate,
  RollableTemplate,
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Weapon",
  ];

  static _itemStatusOrder = [ "owned", "carried", "mainHand", "offHand", "twoHands", "tail" ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      weaponType: new fields.StringField( {
        required: true,
        nullable: true,
        initial:  "melee",
        choices:  ED4E.weaponType,
      } ),
      weaponSubType: new fields.StringField( {
        required: true,
        initial:  "bow",
        choices:  ED4E.weaponSubType,
      } ),
      wieldingType: new fields.StringField( {
        required: true,
        initial:  "mainHand",
        choices:  ED4E.weaponWieldingType,
      } ),
      damage:        new fields.SchemaField( {
        attribute: new fields.StringField( {
          required: true,
          nullable: false,
          initial:  "str",
          choices:  ED4E.attributes,
        } ),
        baseStep: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        type: new fields.StringField( {
          initial:  "standard",
          choices:  ED4E.damageType,
        } ),
      } ),
      size: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      1,
        max:      7,
        initial:  1,
        integer:  true,
        positive: true,
      } ),
      strengthMinimum: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      1,
        initial:  1,
        integer:  true,
      } ),
      dexterityMinimum: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      1,
        initial:  1,
        integer:  true,
      } ),
      range: new fields.SchemaField( {
        shortMin: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        shortMax: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        longMin: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        longMax: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      1,
          initial:  1,
          integer:  true,
        } ),
      } ),
      ammunition: new fields.SchemaField( {
        type: new fields.StringField( {
          required: true,
          nullable: true,
          blank:    true,
          initial:  "",
          choices:  ED4E.ammunitionType,
        } ),
      } ),
      forgeBonus: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      armorType: new fields.StringField( {
        required: true,
        nullable: true,
        blank:    true,
        initial:  "physical",
        choices:  ED4E.armor,
      } ),
    } );
  }

  /* -------------------------------------------- */
  /*  Getters                   */
  /* -------------------------------------------- */

  /** @override */
  get ammoAmount() {
    if ( !this.isRanged ) return null;
    if ( this.isActorEmbedded ) {
      const ammunitionItems = this.containingActor.getAmmo( this.ammunition.type );
      return sum( ammunitionItems.map( item => ( item.system.amount ?? 0 ) * ( item.system.bundleSize ?? 0 ) ) );
    } else return 0;
  }

  /** @inheritDoc */
  get baseRollOptions() {
    return DamageRollOptions.fromActor(
      {
        step:            {
          base:      this.damageTotal,
          modifiers: {},
        },
        extraDice:       {
        // this should be the place for things like flame weapon, etc. but still needs to be implemented
        },
        damageSource:    this.parent?.name,
        weaponUuid:      this.parent?.uuid,
        armorType:       this.armorType,
        damageType:      this.damage.type,
      },
      this.containingActor
    );

  }

  /** @override */
  get damageTotal() {
    if ( this.isActorEmbedded ) {
      const damageAttribute = this.damage.attribute;
      const actorAttribute = this.containingActor.system.attributes[damageAttribute];
      return this.damage.baseStep + this.forgeBonus + actorAttribute.step;
    } else return this.damage.baseStep + this.forgeBonus;
  }

  get equipped() {
    return this.itemStatus === this.wieldingType;
  }

  /** @override */
  get nextItemStatus() {
    const namegiver = this.parent.parent?.namegiver;
    const weaponSizeLimits = namegiver?.system.weaponSize;

    // no limits or tail given, every status is okay
    if ( !weaponSizeLimits ) return super.nextItemStatus;
    return this._rotateValidItemStatus( this.statusIndex, false );
  }

  /** @override */
  get previousItemStatus() {
    const namegiver = this.parent.parent?.namegiver;
    const weaponSizeLimits = namegiver?.system.weaponSize;

    // no limits or tail given, every status is okay
    if ( !weaponSizeLimits ) return super.previousItemStatus;
    return this._rotateValidItemStatus( this.statusIndex, true );
  }

  /**
   * Checks if the weapon type is a two-handed ranged weapon. True if the weapon
   * type is either 'bow' or 'crossbow', and false otherwise.
   * @type {boolean}
   */
  get isTwoHandedRanged() {
    return false;
    // TODO: add additional datafield
  }

  get isRanged() {
    return Object.keys( 
      filterObject( ED4E.weaponType, ( _, value ) => value.ranged ) 
    ).includes( this.weaponType );
  }

  /* -------------------------------------------- */
  /*  Methods                   */
  /* -------------------------------------------- */

  /**
   * Rotates the status of the item based on the current status.
   * The rotation follows the order defined in `_itemStatusOrder`.
   * @param {number} currentStatusIndex - The index of the current status in `_itemStatusOrder`.
   * @param {boolean} backwards - If true, rotates the status backwards. If false or not provided, rotates the status forwards.
   * @returns {string} The next valid status for the item if rotating forwards, or the previous valid status if rotating backwards.
   */
  _rotateValidItemStatus( currentStatusIndex, backwards = false ) {
    return backwards ? this._getPreviousItemStatus( currentStatusIndex ) : this._getNextItemStatus( currentStatusIndex );
  }

  /**
   * Determines the next status of the item based on the current status.
   * It follows the order defined in `_itemStatusOrder`.
   * If the item can be handled with the next status, it returns the next status.
   * If not, it recursively calls itself with the next status index until it finds a valid status.
   * @param {number} currentStatusIndex - The index of the current status in `_itemStatusOrder`.
   * @returns {string} The next valid status for the item.
   */
  _getNextItemStatus( currentStatusIndex ) {
    const statusOrder = this.constructor._itemStatusOrder;
    const namegiver = this.parent.parent?.namegiver;
    const nextStatusIndex = currentStatusIndex + 1;

    switch ( statusOrder[currentStatusIndex] ) {
      case "owned":
        return "carried";
      case "carried":
        return this.canBeHandledWith( "mainHand", namegiver )
          ? "mainHand"
          : this._getNextItemStatus( nextStatusIndex );
      case "mainHand":
        return this.canBeHandledWith( "offHand", namegiver )
          ? "offHand"
          : this._getNextItemStatus( nextStatusIndex );
      case "offHand":
        return this.canBeHandledWith( "twoHands", namegiver )
          ? "twoHands"
          : this._getNextItemStatus( nextStatusIndex );
      case "twoHands":
        return this.canBeHandledWith( "tail", namegiver ) ? "tail" : "owned";
      case "tail":
      default:
        return "owned";
    }
  }

  _getPreviousItemStatus( currentStatusIndex ) {
    const statusOrder = this.constructor._itemStatusOrder;
    const namegiver = this.parent.parent?.namegiver;
    let currentStatusIdx = currentStatusIndex;
    const previousStatusIndex = currentStatusIdx - 1;

    if ( currentStatusIdx < 0 ) currentStatusIdx = statusOrder.length - 1;

    switch ( statusOrder[currentStatusIdx] ) {
      case "tail":
        return this.canBeHandledWith( "twoHands", namegiver )
          ? "twoHands"
          : this._getPreviousItemStatus( previousStatusIndex );
      case "twoHands":
        return this.canBeHandledWith( "offHand", namegiver )
          ? "offHand"
          : this._getPreviousItemStatus( previousStatusIndex );
      case "offHand":
        return this.canBeHandledWith( "mainHand", namegiver )
          ? "mainHand"
          : this._getPreviousItemStatus( previousStatusIndex );
      case "mainHand":
        return "carried";
      case "carried":
        return "owned";
      case "owned":
        return this.canBeHandledWith( "tail", namegiver )
          ? "tail"
          : this._getPreviousItemStatus( previousStatusIndex );
      default:
        return "owned";
    }
  }

  async rollDamage() {
    const rollData = this.baseRollOptions;

    const roll = await RollPrompt.waitPrompt(
      new DamageRollOptions( rollData ),
      {
        rollData: this.containingActor,
      }
    );
    return RollProcessor.process( roll, this.containingActor, { rollToMessage: true } );
  }

  /**
   * Check if the weapon is possible for the given handling type based on the  limits given in the namegiver.
   * @param {string} handlingType The handling type to check for. One of "mainHand", "offHand", "oneHand", "twoHands", "tail".
   * @param {ItemEd} namegiver The namegiver document.
   * @returns {boolean} True if the weapon is within the limits of the namegiver for the given handling.
   * If no namegiver or appropriate limits are given, returns `undefined`.
   */
  canBeHandledWith( handlingType, namegiver ) {
    const hasTailAttack = namegiver?.system.tailAttack;
    const weaponSizeLimits = namegiver?.system.weaponSize;
    const size = this.size;
    if ( !weaponSizeLimits || size === null || hasTailAttack === null ) return undefined;

    switch ( handlingType ) {
      case "oneHand":
      case "mainHand":
      case "offHand":
        return inRange( size, weaponSizeLimits.oneHanded.min, weaponSizeLimits.oneHanded.max )
          && !this.isTwoHandedRanged;
      case "twoHands":
        return inRange( size, weaponSizeLimits.twoHanded.min, weaponSizeLimits.twoHanded.max )
          || this.isTwoHandedRanged;
      case "tail":
        return hasTailAttack && size <= 2;
      default:
        return undefined;
    }
  }
}