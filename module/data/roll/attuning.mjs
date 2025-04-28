import EdRollOptions from "./common.mjs";
import { ED4E } from "../../../earthdawn4e.mjs";


export default class AttuningRollOptions extends EdRollOptions {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.AttuningRollOptions",
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      attuningType: new fields.StringField( {
        choices: ED4E.attuningType,
      } ),
      spellsToAttune: new fields.SetField(
        new fields.DocumentUUIDField( {
          type:     "Item",
          embedded: false, // when casting raw or from grimoire, the spell doesn't necessarily exist in the actor
        } ),
        {
          required: true,
          min:      1,
        },
      ),
      matrix: new fields.DocumentUUIDField( {
        type:     "Item",
        embedded: true,
      } ),
    } );
  }

  static fromActor( data, actor, options = {} ) {
    const modifiedData = {
      ...data,
      testType: "action",
      rollType: "attuning",
    };
    return super.fromActor( modifiedData, actor, options );
  }

  // region Rendering

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.spellsToAttune = await Promise.all( this.spellsToAttune.map( async spell => await fromUuid( spell ) ) );
    newContext.matrix = await fromUuid( this.matrix );

    return newContext;
  }

  // endregion

}