import EdRollOptions from "./common.mjs";
import ED4E, { ACTORS, COMBAT } from "../../config/_module.mjs";
import { createContentAnchor } from "../../utils.mjs";

/**
 * @typedef { object } EdDamageRollOptionsInitializationData
 * @augments { EdRollOptionsInitializationData }
 * @property { ReturnType<ClientDocumentMixin> & Document } [sourceDocument] The source document that caused the damage.
 * Can be omitted if `sourceUuid` in {@link DamageRollOptions} is provided.
 */

/**
 * Roll options for damage rolls.
 * @augments { EdRollOptions }
 * @property { string } damageSourceType The type of damage source (e.g., weapon, spell). Must be one of the values
 * defined in {@link module:config~COMBAT~damageSourceType}.
 * @property { string } [armorType=""] The type of armor to consider when calculating damage. Must be one of the values
 * defined in {@link module:config~ACTORS~armor}.
 * @property { string } [damageType="standard"] The type of damage to roll. Must be one of the values defined in
 * {@link module:config~COMBAT~damageType}.
 * @property { boolean } [ignoreArmor=false] Whether to ignore armor when calculating damage.
 * @property { boolean } [naturalArmorOnly=false] Whether to only consider natural armor when calculating damage.
 * @property { string } [sourceUuid=null] The UUID of the source item or actor that caused the damage, if applicable.
 * @property { object } [element] The element and subtype of the damage, if applicable.
 * @property { string } [element.type] The type of element (e.g., fire, water). Must be one of the values defined in
 * {@link module:config~MAGIC~elements}.
 * @property { string } [element.subtype] The subtype of the element (e.g., acid, cold). Must be one of the values defined in
 * {@link module:config~MAGIC~elementSubtypes}.
 */
export default class DamageRollOptions extends EdRollOptions {

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.DamageRollOptions",
  ];

  /** @inheritdoc */
  static TEST_TYPE = "effect";

  /** @inheritdoc */
  static ROLL_TYPE = "damage";

  /** @inheritdoc */
  static GLOBAL_MODIFIERS = [
    "allDamage",
    ...super.GLOBAL_MODIFIERS,
  ];

  // endregion

  // region Static Methods

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      damageSourceType:   new fields.StringField( {
        required: true,
        choices:  COMBAT.damageSourceType,
      } ),
      armorType:          new fields.StringField( {
        required: true,
        nullable: true,
        blank:    true,
        initial:  "",
        choices:  ACTORS.armor,
      } ),
      damageType:         new fields.StringField( {
        initial:  "standard",
        choices:  COMBAT.damageType,
      } ),
      ignoreArmor:        new fields.BooleanField( {
        initial:  false,
      } ),
      naturalArmorOnly:   new fields.BooleanField( {
        initial:  false,
      } ),
      sourceUuid:         new fields.DocumentUUIDField( {
      } ),
      element:            new fields.SchemaField(
        {
          type: new fields.StringField( {
            required: false,
            choices:  ED4E.elements,
          } ),
          subtype: new fields.StringField( {
            required: false,
            choices:  ED4E.elementSubtypes,
          } ),
        },
        {
          required: false,
        }
      ),
    } );
  }

  /**
   * @inheritDoc
   * @param { EdDamageRollOptionsInitializationData & Partial<DamageRollOptions> } data The data to initialize the roll options with.
   */
  static fromData( data, options = {} ) {
    data.sourceUuid ??= data.sourceDocument?.uuid;

    data.armorType ??= this._prepareArmorType( data );
    data.damageType ??= this._prepareDamageType( data );
    data.ignoreArmor ??= this._prepareIgnoreArmor( data );
    data.naturalArmorOnly ??= this._prepareNaturalArmorOnly( data );
    data.element ??= this._prepareElement( data );

    return /** @type { DamageRollOptions } */ super.fromData( data, options );
  }

  /**
   * @inheritDoc
   * @param { EdDamageRollOptionsInitializationData & Partial<DamageRollOptions> } data The data to initialize the roll options with.
   */
  static fromActor( data, actor, options = {} ) {
    return /** @type { DamageRollOptions } */ super.fromActor( data, actor, options );
  }

  // endregion

  // region Data Initialization

  /** @inheritDoc */
  _getChatFlavorData() {
    return {
      damageSource: this.sourceUuid ?
        createContentAnchor( fromUuidSync( this.sourceUuid ) ).outerHTML
        : COMBAT.damageSourceType[ this.damageSourceType ],
      armorType:    ACTORS.armor[ this.armorType ] || "",
    };
  }

  /** @inheritDoc */
  static _prepareStepData( data ) {
    if ( !foundry.utils.isEmpty( data.step ) ) return data.step;

    const sourceDocument = data.sourceDocument || fromUuidSync( data.sourceUuid );
    const stepData = {};
    switch ( data.damageSourceType ) {
      case "arbitrary":
      case "falling":
      case "poison":
      case "spell":
      case "unarmed":
      case "warping":
        stepData.base = 0;
        break;
      case "weapon":
        stepData.base = sourceDocument.system.damageTotal;
        break;
      default:
        throw new Error( `Invalid damage source type: ${data.damageSourceType}` );
    }

    return ;
  }

  /** @inheritDoc */
  static _prepareStrainData( data ) {
    const sourceDocument = data.sourceDocument || fromUuidSync( data.sourceUuid );

    switch ( data.damageSourceType ) {
      case "arbitrary":
      case "falling":
      case "poison":
      case "warping":
        return null;
      case "spell":
      case "unarmed":
      case "weapon":
        return {
          base: sourceDocument?.system?.strain || 0,
        };
      default:
        throw new Error( `Invalid damage source type: ${data.damageSourceType}` );
    }
  }

  /**
   * Used when initializing this data model. Retrieves the armor type based on the `damageSourceType`.
   * @param { EdDamageRollOptionsInitializationData & Partial<DamageRollOptions> } data The input data object containing relevant ability information.
   * @returns { keyof module:config~ACTORS~armor } The armor type to use for the damage roll.
   */
  static _prepareArmorType( data ) {
    if ( data.armorType ) return data.armorType;

    let armorType = "";
    const sourceDocument = data.sourceDocument || fromUuidSync( data.sourceUuid );
    if ( sourceDocument ) armorType = sourceDocument.system?.armorType || "";

    switch ( data.damageSourceType ) {
      case "arbitrary":
      case "falling":
      case "poison":
        armorType = "";
        break;
      case "warping":
        armorType = "mystical";
        break;
      case "unarmed":
        armorType = "physical";
        break;
      case "spell":
      case "weapon":
        armorType = sourceDocument.system?.armorType || "";
        break;
      default:
        throw new Error( `Invalid damage source type: ${data.damageSourceType}` );

    }

    return armorType;
  }

  // No need for target difficulty since damage rolls are effect tests

  // endregion

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.hasAssignedCharacter = !!game.user.character;
    newContext.damageSourceHeader = this.sourceUuid ?
      createContentAnchor( fromUuidSync( this.sourceUuid ) ).outerHTML
      : COMBAT.damageSourceType[ this.damageSourceType ];

    return newContext;
  }

}