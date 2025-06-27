import EdRollOptions from "./common.mjs";
import { createContentAnchor } from "../../utils.mjs";


export default class ThreadWeavingRollOptions extends EdRollOptions {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.ThreadWeavingRollOptions",
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      spellUuid: new fields.DocumentUUIDField( {
        type:     "Item",
        embedded: true,
      } ),
      threads: new fields.SchemaField( {
        required: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        extra: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
      } ),
    } );
  }

  /** @inheritDoc */
  _getChatFlavorData() {
    return {
      sourceActor: createContentAnchor( fromUuidSync( this.rollingActorUuid ) ).outerHTML,
      spell:       createContentAnchor( fromUuidSync( this.spellUuid ) ).outerHTML,
      step:        this.step.total,
    };
  }

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.spell = await fromUuid( this.spellUuid );
    newContext.threads = this.threads;
    newContext.threads.totalRequired = this.threads.required + this.threads.extra;
    newContext.threads.woven = {
      now: Math.min(
        newContext.numSuccesses,
        newContext.spell.system.missingThreads
      ),
    };
    newContext.threads.woven.total = newContext.threads.woven.now + newContext.spell.system.threads.woven;
    newContext.doneWeaving = newContext.threads.woven.total >= newContext.threads.totalRequired;
    newContext.rollingActor = await fromUuid( this.rollingActorUuid );
    newContext.rollingActorTokenDocument = await context.rollingActor?.getTokenDocument();

    return newContext;
  }

}