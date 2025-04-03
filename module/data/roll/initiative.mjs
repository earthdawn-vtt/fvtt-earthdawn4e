import EdRollOptions from "./common.mjs";

export default class InitiativeRollOptions extends EdRollOptions {

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
      } ), {} ),
    } );
  }

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );
    newContext.substitutionAbility = this.substitutionAbility;
    newContext.increaseAbilities = this.increaseAbilities;
    return newContext;
  }

}