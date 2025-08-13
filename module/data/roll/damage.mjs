import EdRollOptions from "./common.mjs";
import ED4E from "../../config/_module.mjs";
import { createContentAnchor } from "../../utils.mjs";

export default class DamageRollOptions extends EdRollOptions {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.DamageRollOptions",
  ];

  static TEST_TYPE = "effect";

  static ROLL_TYPE = "damage";

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      damageSource: new fields.StringField( {
        initial: "???",
      } ),
      armorType:         new fields.StringField( {
        required: true,
        nullable: true,
        blank:    true,
        initial:  "",
        choices:  ED4E.armor,
      } ),
      damageType: new fields.StringField( {
        initial:  "standard",
        choices:  ED4E.damageType,
      } ),
      ignoreArmor: new fields.BooleanField( {
        initial:  false,
      } ),
      naturalArmorOnly: new fields.BooleanField( {
        initial:  false,
      } ),
      weaponUuid:        new fields.DocumentUUIDField( {
        type:     "Item",
        embedded: true,
      } ),
      element: new fields.SchemaField(
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

  /** @inheritDoc */
  async _preUpdate( changes, options, user ){
    if ( await super._preUpdate( changes, options, user ) === false ) return false;

    super._preUpdate( changes, options, user );
    await this._addDamageAbilityModifiers( changes );
    await this._removeDamageAbilityModifiers( changes );
  }

  // region Source Initialization

  /** @inheritDoc */
  _getChatFlavorData() {
    return {
      damageSource: this.weaponUuid ?
        createContentAnchor( fromUuidSync( this.weaponUuid ) ).outerHTML
        : this.damageSource,
      armorType:    ED4E.armor[ this.armorType ] || "",
    };
  }

  /** @inheritDoc */
  _prepareStepData( data ) {
    if ( !foundry.utils.isEmpty( data.step ) ) return data.step;

    return super._prepareStepData( data );
  }

  /** @inheritDoc */
  _prepareStrainData( data ) {
    return {
      base:      0,
      modifiers: {},
    };
  }

  /** @inheritDoc */
  _prepareTargetDifficulty( data ) {
    return super._prepareTargetDifficulty( data );
  }

  // endregion

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.hasAssignedCharacter = !!game.user.character;
    newContext.damageSourceHeader = this.weaponUuid ?
      createContentAnchor( fromUuidSync( this.weaponUuid ) ).outerHTML
      : this.damageSource;

    return newContext;
  }

}