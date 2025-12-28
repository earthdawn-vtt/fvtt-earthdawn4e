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
 * @property { ItemEd } [truePattern] The document that holds the true pattern the thread is woven to.
 * Can be omitted if `truePatternUuid` is provided.
 * @property { string } [truePatternUuid] The UUID of the document that holds the true pattern the thread
 * is woven to. Can be omitted if `truePattern` is provided.
 * @property { number } [newThreadRank=1] The rank of the new thread being created, if any.
 */

/**
 * Roll options for weaving threads to spells and true patterns.
 * @augments { EdRollOptions }
 * @property { string } weavingAbilityUuid The UUID of the ability used for thread weaving.
 * @property { string } spellUuid The UUID of the spell the threads are woven for, if any.
 * @property { { required: number, extra: number } } threads The number of threads for the spell, if any.
 * @property { number } [newThreadRank] The rank of the new thread being created, if any.
 * @property { string } [truePatternUuid] The UUID of the document that holds the true pattern the thread
 * is woven to, if any.
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
      truePatternUuid:    new fields.DocumentUUIDField( {} ),
      newThreadRank:    new fields.NumberField( {
        required: false,
        nullable: false,
        min:      1,
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
      }, {
        nullable: true,
        initial:  null,
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
    if ( data.weavingAbility && !data.weavingAbilityUuid ) data.weavingAbilityUuid = data.weavingAbility.uuid;
    if ( data.spell && !data.spellUuid ) data.spellUuid = data.spell.uuid;
    if ( data.truePattern && !data.truePatternUuid ) data.truePatternUuid = data.truePattern.uuid;

    return /** @type { ThreadWeavingRollOptions } */ super.fromData( data, options );
  }

  // endregion

  // region Data Initialization

  /** @inheritDoc */
  _getChatFlavorData() {
    return {
      sourceActor:  createContentAnchor( fromUuidSync( this.rollingActorUuid ) ).outerHTML,
      threadTarget: createContentAnchor( fromUuidSync( this.spellUuid ?? this.truePatternUuid ) )?.outerHTML,
      step:         this.step.total,
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
    if ( spell ) {
      return {
        base:      spell.system.spellDifficulty.weaving,
        modifiers: {},
        public:    true,
      };
    }

    const truePatternDocument = data.truePattern ?? fromUuidSync( data.truePatternUuid );
    if ( !data.newThreadRank ) data.newThreadRank = 1;
    if ( truePatternDocument ) {
      return {
        base:      MAGIC.threadWeavingDifficulty[ data.newThreadRank ],
        modifiers: {},
        public:    true,
      };
    }

    throw new Error( "ThreadWeavingRollOptions: No spell or true pattern found for target difficulty." );
  }

  // endregion

  // region Rendering

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.spell = await fromUuid( this.spellUuid );
    newContext.spellContentAnchor = newContext.spell
      ? createContentAnchor( newContext.spell ).outerHTML
      : undefined;

    newContext.truePattern = await fromUuid( this.truePatternUuid );
    newContext.truePatternContentAnchor = newContext.truePattern
      ? createContentAnchor( newContext.truePattern ).outerHTML
      : undefined;

    newContext.weavingAbility = await fromUuid( this.weavingAbilityUuid );
    newContext.weavingAbilityContentAnchor = createContentAnchor( newContext.weavingAbility ).outerHTML;

    newContext.threads = this.threads;
    if ( newContext.threads ) {
      newContext.threads.totalRequired = this.threads.required + this.threads.extra;
      newContext.threads.woven = {
        now: Math.min(
          newContext.numSuccesses,
          newContext.spell.system.missingThreads
        )
      };
      newContext.threads.woven.total = newContext.threads.woven.now + newContext.spell.system.threads.woven;
      newContext.doneWeaving = newContext.threads.woven.total >= newContext.threads.totalRequired;
    }

    newContext.rollingActor = await fromUuid( this.rollingActorUuid );
    newContext.rollingActorTokenDocument = await context.rollingActor?.getTokenDocument();

    return newContext;
  }

  // endregion

}