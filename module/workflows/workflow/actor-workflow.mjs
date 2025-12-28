import Workflow from "./workflow.mjs";
import ActorEd from "../../documents/actor.mjs";

/**
 * Base class for all workflows that are associated with an Actor.
 * @abstract
 */
export default class ActorWorkflow extends Workflow {

  /**
   * The actor that this workflow is associated with.
   * @type {ActorEd}
   */
  _actor = null;

  /**
   * @override
   * @param {ActorEd} actor The actor that this workflow is associated with.
   * @param {WorkflowOptions} [options] See {@link Workflow#constructor}.
   */
  constructor( actor, options = {} ) {
    if ( !actor || ! ( actor instanceof ActorEd ) )
      throw new TypeError( "ActorWorkflow constructor expects an Actor instance." );

    super( options );
    this._actor = actor;
  }

}