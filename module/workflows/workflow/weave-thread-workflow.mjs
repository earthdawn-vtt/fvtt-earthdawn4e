import Rollable from "./rollable.mjs";
import ActorWorkflow from "./actor-workflow.mjs";
import WorkflowInterruptError from "../workflow-interrupt.mjs";
import DialogEd from "../../applications/api/dialog.mjs";

/**
 * @typedef {object} WeaveThreadWorkflowOptions
 * @property {Document} target - The target document the threads are being woven to. Must have a
 * `truePattern` property in its `system` data, as defined in {@link TruePatternData}.
 */

/**
 * Workflow for weaving threads to true patterns
 */
export default class WeaveThreadWorkflow extends Rollable( ActorWorkflow ) {

  /**
   * The target document the threads are being woven to
   * @type {Document}
   */
  _target;

  /**
   * The thread item being created
   * @type {Item|null}
   */
  _thread;

  /**
   * @inheritDoc
   * @param {ActorEd} weavingActor - The actor performing the weaving
   * @param {WorkflowOptions & WeaveThreadWorkflowOptions} options - Options for the workflow
   */
  constructor( weavingActor, options ) {
    super( weavingActor, options );

    this._target = options.target;

    this._steps.push(
      this.#validateTruePattern.bind( this ),
      this.#createThread.bind( this ),
      this.#updateTargetThreads.bind( this ),
      this.#increaseThreadLevel.bind( this ),
    );
  }

  async #validateTruePattern() {
    if ( !this._target.system.truePattern ) {
      throw new WorkflowInterruptError( "Target does not have a true pattern." );
    }

    if ( !this._target.system.truePattern.canHaveMoreThreads ) {
      const continueWorkflow = await DialogEd.confirm( {
        content: game.i18n.localize( "ED.Dialogs.cannotWeaveMoreThreadsConfirm" ),
        window:  {
          title:   game.i18n.localize( "ED.Dialogs.Title.cannotWeaveMoreThreadsConfirm" ),
        },
      } );
      if ( continueWorkflow === false ) this.cancel();
    }
  }

  async #createThread() {
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