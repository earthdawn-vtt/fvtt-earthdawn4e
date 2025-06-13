import TargetTemplate from "./targeting.mjs";
import ED4E from "../../../config/_module.mjs";
import ThreadTemplate from "./threads.mjs";
import MatrixTemplate from "./matrix.mjs";
import GrimoireTemplate from "./grimoire.mjs";
import ItemDataModel from "../../abstract/item-data-model.mjs";

/**
 * Data model template with information on physical items.
 * @property {object} price                                 price group object
 * @property {number} price.value                           item cost
 * @property {string} price.denomination                    denomination type of the cost
 * @property {number} weight                                item weight
 * @property {number} amount                                amount of the item
 * @property {number} bloodMagicDamage                      number of blood magic damage the actor is receiving
 * @property {object} usableItem                            usable item object
 * @property {boolean} usableItem.isUsableItem        usable item selector
 * @property {number} usableItem.arbitraryStep              arbitrary step
 * @property {string} usableItem.action                     action type of usable item
 * @property {number} usableItem.recoveryPropertyValue      recovery type value
 */
export default class PhysicalItemTemplate extends ItemDataModel.mixin(
  GrimoireTemplate,
  MatrixTemplate,
  TargetTemplate,
  ThreadTemplate,
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.PhysicalItem",
  ];

  /**
   * The order in which this items status is cycled. Represents the default order.
   * Should be defined in the extending class, if different.
   * @type {[string]}
   * @protected
   */
  static _itemStatusOrder = [ "owned", "carried", "equipped" ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      price: new fields.SchemaField( {
        value: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
        } ),
        denomination: new fields.StringField( {
          required: true,
          nullable: true,
          blank:    true,
          trim:     true,
          initial:  "silver",
          choices:  ED4E.denomination,
        } )
      } ),
      weight: new fields.SchemaField( {
        value: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  false,
        } ),
        multiplier: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  1,
        } ),
        calculated: new fields.BooleanField( {
          required: true,
          initial:  false,
        } ),
      } ),
      availability: new fields.StringField( {
        required: true,
        nullable: true,
        blank:    true,
        trim:     true,
        initial:  "average",
        choices:  ED4E.availability,

      } ),
      amount: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  1,
        integer:  true,
      } ),
      bloodMagicDamage: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      usableItem: new fields.SchemaField( {
        isUsableItem: new fields.BooleanField( {
          required: true,
        } ),
        arbitraryStep: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        action: new fields.StringField( {
          required: true,
          nullable: true,
          blank:    true,
          choices:  ED4E.action,
          initial:  "standard",
        } ),
        recoveryPropertyValue: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          max:      5,
          initial:  0,
          choices:  ED4E.recoveryProperty,
          integer:  true,
        } ),
      } ),
      itemStatus: new fields.StringField( {
        required: true,
        nullable: true,
        blank:    false,
        initial:  "owned",
        choices:  ED4E.itemStatus,
      } ),
    } );
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    super.migrateData( source );
    // specific migration functions
  }

  /* -------------------------------------------- */
  /*  Getters                                     */
  /* -------------------------------------------- */

  /**
   * Properties displayed in chat.
   * @type {string[]}
   */
  get chatProperties() {
    // TODO: return object instead of array? to have meaningful keys and you don't have to remember the positions of the values in the array
    return [
      this.parent.usableItem.labels.arbitraryStep,
      this.parent.usableItem.labels.action,
      this.parent.usableItem.labels.recoveryPropertyValue
    ];
  }

  /**
   * Whether the is currently carried (not just owned).
   * @type {boolean}
   */
  get carried() {
    return this.itemStatus === "carried";
  }

  /**
   * Whether the item is currently equipped (not just carried).
   * @type {boolean}
   */
  get equipped() {
    return this.itemStatus === "equipped";
  }

  get statusIndex() {
    return this.constructor._itemStatusOrder.indexOf( this.itemStatus );
  }

  /**
   * Returns the next item status in the sequence. If the item status is undefined
   * it will return the first in the sequence.
   * @type {string}
   */
  get nextItemStatus() {
    const statusOrder = this.constructor._itemStatusOrder;
    // if itemStatus is null or undefined `currentStatusIndex + 1` will result in NaN (Not a Number)
    // NaN || 0 will return 0
    return statusOrder[ ( this.statusIndex + 1 || 0 ) % statusOrder.length ];
  }

  /**
   * Returns the previous item status in the sequence. If the item status is undefined
   * it will return the first in the sequence.
   * @type {string}
   */
  get previousItemStatus(){
    const statusOrder = this.constructor._itemStatusOrder;
    const prevIndex = ( this.statusIndex - 1 ) || 0;
    // if itemStatus is null or undefined `currentStatusIndex - 1` will result in NaN (Not a Number)
    // NaN || 0 will return 0
    // if the previous index is negative, it will return the last index of the array
    return statusOrder[ ( prevIndex < 0 ? ( statusOrder.length - 1 ) : prevIndex ) % statusOrder.length ];
  }

  // region Life Cycle Events

  /** @inheritdoc */
  async _preCreate( data, options, user ) {
    if ( await super._preCreate( data, options, user ) === false ) return false;

    this._prepareGrimoireData( data );
    this._prepareMatrixData( data );
  }

  /** @inheritdoc */
  async _preUpdate( changed, options, user ) {
    if ( await super._preUpdate( changed, options, user ) === false ) return false;

    this._prepareGrimoireData( changed );
    this._prepareMatrixData( changed );
  }

  // endregion

  /* -------------------------------------------- */
  /*  Methods                                     */
  /* -------------------------------------------- */


  /**
   * Set the item status to "carried".
   * @returns {Promise} The updated Item instance.
   */
  async carry() {
    return this.parent.update( {
      "system.itemStatus": "carried"
    } );
  }

  /**
   * Set the item status to "owned".
   * @returns {Promise} The updated Item instance.
   */
  async deposit() {
    return this.parent.update( {
      "system.itemStatus": "owned"
    } );
  }
}