import Rollable from "./rollable.mjs";
import ActorWorkflow from "./actor-workflow.mjs";
import WorkflowInterruptError from "../workflow-interrupt.mjs";
import DialogEd from "../../applications/api/dialog.mjs";
import { getSetting } from "../../settings.mjs";
import ThreadWeavingRollOptions from "../../data/roll/weaving.mjs";

/**
 * @typedef {object} WeaveThreadWorkflowOptions
 * @property {ItemEd} [thread] - The thread item being increased.
 * @property {Document} [target] - The target document the threads are being woven to. Must have a
 * `truePattern` property in its `system` data, as defined in {@link TruePatternData}. Can be omitted and will be
 * ignored if `thread` is provided.
 * @property {ItemEd} [threadWeavingAbility] - The ability item used for the weaving test. If omitted, will be searched
 * from the weaving actor's abilities.
 */

/**
 * Workflow for weaving threads to true patterns
 */
export default class WeaveThreadWorkflow extends Rollable( ActorWorkflow ) {

  /**
   * The target document the threads are being woven to
   * @type {Document|null}
   */
  _target;

  /**
   * The thread item being created
   * @type {Item|null}
   */
  _thread;

  /**
   * The ability item used for the weaving test
   * @type {ItemEd|null}
   */
  _threadWeavingAbility;

  /**
   * The rank of the thread being created or increased
   * @type {number}
   */
  _newThreadRank;

  /**
   * @inheritDoc
   * @param {ActorEd} weavingActor - The actor performing the weaving
   * @param {WorkflowOptions & WeaveThreadWorkflowOptions} options - Options for the workflow
   */
  constructor( weavingActor, options ) {
    super( weavingActor, options );

    if ( !options.thread && !options.target ) {
      throw new Error( "Either 'thread' or 'target' option must be provided." );
    }
    this._thread = options.thread ?? null;
    this._target = options.target ?? null;
    this._threadWeavingAbility = options.threadWeavingAbility ?? null;
    this._newThreadRank = this._thread ? this._thread.system.level + 1 : 1;

    this._rollToMessage = true;
    this._rollPromptTitle = game.i18n.localize( "ED.Dialogs.RollPrompt.Title.weaveThread" );

    this._steps.push(
      this.#initialize.bind( this ),
      this.#validate.bind( this ),
    );
    this._initRollableSteps();
    this._steps.push(
      this.#confirmRoll.bind( this ),
      this.#createThread.bind( this ),
      this.#updateTargetThreads.bind( this ),
      this.#increaseThreadLevel.bind( this ),
    );
  }

  async #initialize() {
    await this.#initializeTarget();
    await this.#initializeThreadWeavingAbility();
  }

  async #initializeTarget() {
    if ( this._thread ) {
      const wovenToUuid = this._thread.system.wovenToUuid;
      this._target = await fromUuid( wovenToUuid );
      if ( !this._target ) {
        throw new WorkflowInterruptError( "Failed to resolve thread's woven to target." );
      }
    }
  }

  async #initializeThreadWeavingAbility() {
    if ( !this._threadWeavingAbility ) {
      this._threadWeavingAbility = this._actor.getSingleItemByEdid(
        getSetting( "edidThreadWeaving" ),
      );
      if ( !this._threadWeavingAbility ) {
        const continueWorkflow = await DialogEd.confirm( {
          content: game.i18n.localize( "ED.Dialogs.missingThreadWeavingAbilityConfirm" ),
          window:  {
            title:   game.i18n.localize( "ED.Dialogs.Title.missingThreadWeavingAbilityConfirm" ),
          },
        } );
        if ( continueWorkflow !== true ) this.cancel();
      }
    }
  }

  async #validate() {
    await this.#validateTruePattern();
    await this.#validateMaxRank();
    await this.#validatePatternKnowledge();
  }

  async #validateTruePattern() {
    if ( !this._target.system.truePattern ) {
      throw new WorkflowInterruptError( "Target does not have a true pattern." );
    }

    if ( !this._thread && !this._target.system.truePattern.canHaveMoreThreads ) {
      const continueWorkflow = await DialogEd.confirm( {
        content: game.i18n.localize( "ED.Dialogs.cannotWeaveMoreThreadsConfirm" ),
        window:  {
          title:   game.i18n.localize( "ED.Dialogs.Title.cannotWeaveMoreThreadsConfirm" ),
        },
      } );
      if ( continueWorkflow === false ) this.cancel();
    }
  }

  async #validateMaxRank() {
    const threadWeavingAbilityRank = this._threadWeavingAbility?.system.rankFinal ?? 0;
    if ( this._newThreadRank > threadWeavingAbilityRank ) {
      const continueWorkflow = await DialogEd.confirm( {
        content: game.i18n.localize( "ED.Dialogs.threadRankExceedsWeavingAbilityConfirm" ),
        window:  {
          title:   game.i18n.localize( "ED.Dialogs.Title.threadRankExceedsWeavingAbilityConfirm" ),
        },
      } );
      if ( continueWorkflow !== true ) this.cancel();
    }
  }

  async #validatePatternKnowledge() {
    const truePatternType = this._target.system.truePattern.truePatternType;
    if ( !truePatternType || [ "patternItem", "groupPattern" ].includes( truePatternType ) ) return;

    if ( !this._target.system.truePattern.threadItemLevels[this._newThreadRank]?.keyKnowledge.isKnown ) {
      const continueWorkflow = await DialogEd.confirm( {
        content: game.i18n.localize( "ED.Dialogs.unknownPatternKeyKnowledgeConfirm" ),
        window:  {
          title:   game.i18n.localize( "ED.Dialogs.Title.unknownPatternKeyKnowledgeConfirm" ),
        },
      } );
      if ( continueWorkflow !== true ) this.cancel();
    }
  }

  async _prepareRollOptions() {
    this._rollOptions = ThreadWeavingRollOptions.fromActor(
      {
        weavingAbility: this._threadWeavingAbility,
        truePattern:    this._target,
        newThreadRank:  this._newThreadRank,
      },
      this._actor,
    );
  }

  async #confirmRoll() {
    this._result = undefined;
    if ( !this._roll.isSuccess ) {
      const continueWorkflow = await DialogEd.confirm( {
        content: game.i18n.localize( "ED.Dialogs.failedWeavingRollConfirm" ),
        window:  {
          title: game.i18n.localize( "ED.Dialogs.Title.failedWeavingRollConfirm" ),
        }
      } );
      if ( continueWorkflow !== true ) this.cancel();
    }
  }

  async #createThread() {
    if ( this._thread ) return;
    const createdItems = await this._actor.createEmbeddedDocuments( "Item", [ {
      name:   game.i18n.format(
        "ED.Item.Thread.defaultName",
        {
          fromActor:    this._actor.name,
          threadTarget: this._target.name
        }
      ),
      type:   "thread",
      system: {
        wovenToUuid: this._target.uuid,
      },
    } ] );
    this._thread = createdItems[ 0 ] ?? null;
    if ( !this._thread ) throw new WorkflowInterruptError( "Failed to create thread item." );
  }

  async #updateTargetThreads() {
    await this._target.system.truePattern.addAttachedThread( this._thread.uuid );
  }

  async #increaseThreadLevel() {
    await this._thread.system.increase();
    this._result = this._thread;
  }

}