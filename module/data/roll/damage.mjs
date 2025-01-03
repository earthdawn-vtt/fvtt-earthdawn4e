import EdRollOptions from "./common.mjs";
import ED4E from "../../config.mjs";

export default class DamageRollOptions extends EdRollOptions {

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      weaponUuid:        new fields.DocumentUUIDField( {
        type:     "Item",
        embedded: true,
      } ),
      damageAbilities: new fields.SetField(
        new fields.DocumentUUIDField( {
          type:     "Item",
          embedded: true,
        } ),
        {}
      ),
      armorType:         new fields.StringField( {
        initial:  "physical",
        choices:  ED4E.armor,
      } ),
      damageType: new fields.StringField( {
        initial:  "standard",
        choices:  ED4E.damageType,
      } ),
      ignoreArmor: new fields.BooleanField( {
        initial:  false,
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
    super._preUpdate( changes, options, user );
    await this._addDamageAbilityModifiers( changes );
    await this._removeDamageAbilityModifiers( changes );
  }

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.hasAssignedCharacter = !!game.user.character;

    return newContext;
  }

  async _addDamageAbilityModifiers( changes ) {
    const addedDamageAbilities = changes.system?.damageAbilities?.difference( this.damageAbilities );
    console.log( "Coming up: addedDamageAbilities", addedDamageAbilities );
  }

  async _removeDamageAbilityModifiers( changes ) {
    const removedDamageAbilities = this.damageAbilities.difference( changes.system?.damageAbilities );
    console.log( "Coming up: removedDamageAbilities", removedDamageAbilities );
  }

}