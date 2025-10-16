import Rollable from "./rollable.mjs";
import ActorWorkflow from "./actor-workflow.mjs";

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
      this.#createThread.bind( this ),
      this.#increaseThreadLevel.bind( this ),
    );
  }

  async #createThread() {
    const createdItems = await this._actor.createEmbeddedDocuments( "Item", [ {
      name:   game.i18n.format( "ED.Item.Thread.defaultName", { threadTarget: this._target.name } ),
      type:   "thread",
      system: {
        wovenToUuid: this._target.uuid,
      },
    } ] );
    this._thread = createdItems[ 0 ] ?? null;
    if ( !this._thread ) throw new Error( "Failed to create thread item." );
  }

  async #increaseThreadLevel() {
    await this._thread.system.increase();
    this._result = this._thread;
  }

}