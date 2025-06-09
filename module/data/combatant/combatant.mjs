import SystemDataModel from "../abstract.mjs";

export default class CombatantData extends SystemDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.General.Combatant",
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      replacementEffect: new fields.DocumentUUIDField( {
        nullable: true,
        initial:  null,
        type:     "Item",
        embedded: true,
      } ),
      increaseAbilities: new fields.SetField( new fields.DocumentUUIDField( {
        nullable: true,
        initial:  null,
        type:     "Item",
        embedded: true,
      } ) ),
      savePromptSettings: new fields.BooleanField( {
        initial: false,
      } ),
      keepInitiative: new fields.BooleanField( {
        initial: false,
      } ),
    } );
  }

}