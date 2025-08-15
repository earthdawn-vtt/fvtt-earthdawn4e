import EdRollOptions from "./common.mjs";
import { createContentAnchor } from "../../utils.mjs";
import { MAGIC } from "../../config/_module.mjs";

/**
 * @typedef { object } EdThreadWeavingRollOptionsInitializationData
 * @augments { EdRollOptionsInitializationData }
 * @property { ItemEd } [weavingAbility] The ability used for thread weaving.
 * Can be omitted if `weavingAbilityUuid` is provided.
 * @property { string } [weavingAbilityUuid] The UUID of the ability used for thread weaving.
 * Can be omitted if `weavingAbility` is provided.
 * @property { ItemEd } [spell] The spell the threads are woven for.
 * Can be omitted if `spellUuid` is provided.
 * @property { string } [spellUuid] The UUID of the spell the threads are woven for.
 * Can be omitted if `spell` is provided.
 * @property { ItemEd } [grimoire] The grimoire item, if a grimoire is used to cast the spell.
 */

/**
 * Roll options for weaving threads.
 * @augments { EdRollOptions }
 * @property { string } spellUuid The UUID of the spell the threads are woven for.
 * @property { string } weavingAbilityUuid The UUID of the ability used for thread weaving.
 * @property { { required: number, extra: number } } threads The number of threads
 */
export default class ThreadWeavingRollOptions extends EdRollOptions {

  // region Static Properties

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

  // endregion

  // region Static Methods

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

  /**
   * @inheritDoc
   * @param { EdThreadWeavingRollOptionsInitializationData & Partial<ThreadWeavingRollOptions> } data The data to initialize the roll options with.
   * @returns { ThreadWeavingRollOptions } A new instance of ThreadWeavingRollOptions.
   */
  static fromActor( data, actor, options = {} ) {
    return /** @type { ThreadWeavingRollOptions } */ super.fromActor( data, actor, options );
  }

  /**
   * @inheritDoc
   * @param { EdThreadWeavingRollOptionsInitializationData & Partial<ThreadWeavingRollOptions> } data The data to initialize the roll options with.
   * @returns { ThreadWeavingRollOptions } A new instance of ThreadWeavingRollOptions.
   */
  static fromData( data, options = {} ) {
    return /** @type { ThreadWeavingRollOptions } */ super.fromData( data, options );
  }

  // endregion

  // region Data Initialization

  /** @inheritDoc */
  _getChatFlavorData() {
    return {
      sourceActor: createContentAnchor( fromUuidSync( this.rollingActorUuid ) ).outerHTML,
      spell:       createContentAnchor( fromUuidSync( this.spellUuid ) ).outerHTML,
      step:        this.step.total,
    };
  }

  /** @inheritDoc */
  static _prepareStepData( data ) {
    if ( data.step ) return data.step;

    let weavingAbility = data.weavingAbility ?? fromUuidSync( data.weavingAbilityUuid );
    if ( !weavingAbility ) {
      throw new Error( "ThreadWeavingRollOptions: No weaving ability found." );
    }

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

  /** @inheritDoc */
  static _prepareStrainData( data ) {
    if ( data.strain ) return data.strain;

    let weavingAbility = data.weavingAbility ?? fromUuidSync( data.weavingAbilityUuid );
    if ( !weavingAbility ) {
      throw new Error( "ThreadWeavingRollOptions: No weaving ability found." );
    }

    return weavingAbility.system.baseRollOptions.strain;
  }

  /** @inheritDoc */
  static _prepareTargetDifficulty( data ) {
    if ( data.target ) return data.target;

    const spell = data.spell ?? fromUuidSync( data.spellUuid );
    if ( !spell ) {
      throw new Error( "ThreadWeavingRollOptions: No spell found." );
    }

    return {
      base:      spell.system.spellDifficulty.weaving,
      modifiers: {},
      public:    true,
    };
  }

  // endregion

  // region Rendering

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.spell = await fromUuid( this.spellUuid );
    newContext.spellContentAnchor = createContentAnchor( newContext.spell ).outerHTML;
    newContext.weavingAbility = await fromUuid( this.weavingAbilityUuid );
    newContext.weavingAbilityContentAnchor = createContentAnchor( newContext.weavingAbility ).outerHTML;
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

  // endregion

}