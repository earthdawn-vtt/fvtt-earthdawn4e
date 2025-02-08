import ED4E from "../../config.mjs";
import EdRollOptions from "./common.mjs";

export default class HalfMagicRollOptions extends EdRollOptions {

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      discipline: new fields.DocumentUUIDField( {
        type:     "Item",
        embedded: true,
        label:    this.labelKey( "HalfMagicRollOptions.discipline" ),
        hint:     this.hintKey( "HalfMagicRollOptions.discipline" ),
      } ),
      attribute: new fields.StringField( {
        required: true,
        initial:  "per",
        choices:  ED4E.attributes,
        label:    this.labelKey( "HalfMagicRollOptions.attribute" ),
        hint:     this.hintKey( "HalfMagicRollOptions.attribute" ),
      } ),
    } );
  }

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    // newContext.ability = await fromUuid( this.abilityUuid );
    // newContext.rollingActor = await fromUuid( this.rollingActorUuid );
    // newContext.rollingActorTokenDocument = await context.rollingActor?.getTokenDocument();

    return newContext;
  }

}