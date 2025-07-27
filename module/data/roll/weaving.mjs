import EdRollOptions from "./common.mjs";
import { createContentAnchor } from "../../utils.mjs";
import { MAGIC } from "../../config/_module.mjs";


export default class ThreadWeavingRollOptions extends EdRollOptions {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.ThreadWeavingRollOptions",
  ];

  /** @inheritdoc */
  static TEST_TYPE = "action";

  /** @inheritdoc */
  static ROLL_TYPE = "threadWeaving";

  /** @inheritdoc */
  static GLOBAL_MODIFIERS = [
    "allActions",
    ...super.GLOBAL_MODIFIERS,
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      spellUuid: new fields.DocumentUUIDField( {
        type:     "Item",
      } ),
      weavingAbilityUuid: new fields.DocumentUUIDField( {
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
  _prepareStepData( data ) {
    if ( data.step ) return data.step;

    let weavingAbility = data.weavingAbility ?? fromUuidSync( data.weavingAbilityUuid );

    const stepData = weavingAbility.system.baseRollOptions.step || {};

    stepData.base ??= weavingAbility.system.rankFinal;

    stepData.modifiers ??= {};
    if (
      data.grimoire?.system.isGrimoire
      && !data.grimoire.system.grimoireBelongsTo( data.rollingActorUuid )
    ) {
      stepData.modifiers[
        game.i18n.localize( "ED.Rolls.Modifiers.grimoirePenalty" )
      ] = MAGIC.grimoireModifiers.notOwned;
    }

    return stepData;
  }

  _prepareStrainData( data ) {
    if ( data.strain ) return data.strain;

    let weavingAbility = data.weavingAbility ?? fromUuidSync( data.weavingAbilityUuid );

    return weavingAbility.system.baseRollOptions.strain;
  }

  _prepareTargetDifficulty( data ) {
    if ( data.target ) return data.target;

    const spell = data.spell ?? fromUuidSync( data.spellUuid );

    return {
      base:      spell.system.spellDifficulty.weaving,
      modifiers: {},
      public:    true,
    };
  }

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.spell = await fromUuid( this.spellUuid );
    newContext.spellContentAnchor = createContentAnchor( newContext.spell ).outerHTML;
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