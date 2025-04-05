import SystemDataModel from "../abstract.mjs";

export default class CombatantData extends SystemDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      replacementEffect: new fields.DocumentUUIDField( {
        nullable: true,
        initial:  null,
        type:     "Item",
        embedded: true,
        label:    this.labelKey( "Combatant.replacementEffect" ),
        hint:     this.hintKey( "Combatant.replacementEffect" ),
      } ),
      increaseAbilities: new fields.SetField( new fields.DocumentUUIDField( {
        nullable: true,
        initial:  null,
        type:     "Item",
        embedded: true,
      } ), {
        label: this.labelKey( "Combatant.increaseAbilities" ),
        hint:  this.hintKey( "Combatant.increaseAbilities" ),
      } ),
      savePromptSettings: new fields.BooleanField( {
        initial: false,
        label:   this.labelKey( "Combatant.savePromptSettings" ),
        hint:    this.hintKey( "Combatant.savePromptSettings" ),
      } ),
    } );
  }

}