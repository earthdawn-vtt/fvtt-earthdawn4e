import AbilityRollOptions from "./ability.mjs";

export default class AttackRollOptions extends AbilityRollOptions {

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      weapon:        new fields.DocumentUUIDField( {
        type:     "Item",
        embedded: true,
      } ),
    } );
  }

  async getFlavorTemplateData( context ) {
    context.targets = await Promise.all( this.target.tokens.map( tokens => fromUuid( tokens ) ) );
    return context;
  }

}