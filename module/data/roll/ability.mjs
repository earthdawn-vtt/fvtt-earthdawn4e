import EdRollOptions from "./common.mjs";

export default class AbilityRollOptions extends EdRollOptions {

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      rollingActorUuid: new fields.DocumentUUIDField( {
        required: false,
        label:    "TODO.RollingActor",
        hint:     "TODO.RollingActorHint",
      } ),
      abilityUuid: new fields.DocumentUUIDField( {
        type:     "Item",
        embedded: true,
      } ),
    } );
  }

  async getFlavorTemplateData( context ) {
    context = await super.getFlavorTemplateData( context );

    context.ability = await fromUuid( this.abilityUuid );
    context.rollingActor = await fromUuid( this.rollingActorUuid );
    context.rollingActorTokenDocument = await context.rollingActor?.getTokenDocument();

    return context;
  }

}