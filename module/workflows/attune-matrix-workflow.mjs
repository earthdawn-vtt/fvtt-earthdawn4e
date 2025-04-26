import ActorWorkflow from "./workflow/actor-workflow.mjs";

/**
 * @typedef {object} AttuneMatrixWorkflowOptions
 * @property {ItemEd[]} matrices The matrices that are available to the actor.
 * @property {ItemEd[]} spells All available spells.
 */

export default class AttuneMatrixWorkflow extends ActorWorkflow {

  /**
   * The matrices that are available to the actor.
   * @type {ItemEd[]}
   */
  _matrices = [];

  /**
   * The spells that are available to the actor.
   * @type {ItemEd[]}
   */
  _spells = [];

  /**
   * @param {ActorEd} attuningActor - The actor that is reattuning the matrices.
   * @param {WorkflowOptions&AttuneMatrixWorkflowOptions} options - The options for the attuning workflow.
   */
  constructor( attuningActor, options ) {
    super( attuningActor, options );

    this._matrices = options.matrices;
    this._spells = options.spells;
  }

}