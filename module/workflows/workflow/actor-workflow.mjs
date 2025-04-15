import Workflow from "./workflow.mjs";

/**
 * Base class for all workflows that are associated with an Actor.
 * @abstract
 */
export default class ActorWorkflow extends Workflow {

  /**
   * The actor that this workflow is associated with.
   * @type {foundry.documents.Actor}
   */
  _actor = null;

  /**
   * @override
   * @param {foundry.documents.Actor} actor The actor that this workflow is associated with.
   * @param {WorkflowOptions} [options] See {@link Workflow#constructor}.
   */
  constructor( actor, options = {} ) {
    if ( ! ( actor instanceof foundry.documents.Actor ) )
      throw new TypeError( "ActorWorkflow constructor expects an Actor instance." );

    super( options );
    this._actor = actor;
  }

}