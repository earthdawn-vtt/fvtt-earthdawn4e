import EdRollOptions from "./common.mjs";

export default class AttackRollOptions extends EdRollOptions {

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      rollingActor: new fields.DocumentUUIDField( {
        required: false,
        label:    "TODO.RollingActor",
        hint:     "TODO.RollingActorHint",
      } ),
      attackAbility: new fields.DocumentUUIDField( {
        type:     "Item",
        embedded: true,
      } ),
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