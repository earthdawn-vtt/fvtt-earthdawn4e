import EdRollOptions from "./common.mjs";

export default class AbilityRollOptions extends EdRollOptions {

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      rollingActor: new fields.DocumentUUIDField( {
        required: false,
        label:    "TODO.RollingActor",
        hint:     "TODO.RollingActorHint",
      } ),
      ability: new fields.DocumentUUIDField( {
        type:     "Item",
        embedded: true,
      } ),
    } );
  }

}