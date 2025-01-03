import EdRollOptions from "./common.mjs";

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
    } );
  }

  /** @inheritDoc */
  async _preUpdate( changes, options, user ){
    super._preUpdate( changes, options, user );
    await this._addDamageAbilityModifiers( changes );
    await this._removeDamageAbilityModifiers( changes );
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