import ActorWorkflow from "./actor-workflow.mjs";

/**
 * @typedef {object} AttuneMatrixWorkflowOptions
 * @property {ItemEd[]} matrices The matrices that are available to the actor.
 * @property {ItemEd[]} spells All available spells.
 * @property {string} firstMatrix The UUID for a matrix that should be focused when displaying the attune matrix prompt.
 */

export default class AttuneWorkflow extends ActorWorkflow {

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
   * A mapping defining which spells should be attuned to which matrix.
   * Keys are the IDs of the matrix to which to attune the values, arrays of spell uuids.
   * @type {{[matrixId: string]: string[]}}
   */
  _toAttune;

  /**
   * An optional ability with which an attune test should be rolled. "Patterncraft"
   * for attuning grimoires, "Thread Weaving" for attuning matrices.
   * @type {ItemEd}
   */
  _attuneAbility;

  /**
   *
   * @type {string}
   */
  _firstMatrixUuid;

  /**
   * @param {ActorEd} attuningActor - The actor that is reattuning the matrices.
   * @param {WorkflowOptions&AttuneMatrixWorkflowOptions} options - The options for the attuning workflow.
   */
  constructor( attuningActor, options ) {
    super( attuningActor, options );
    const { matrices, spells, firstMatrix } = options;

    this._matrices = matrices;
    this._spells = spells;
    this._firstMatrixUuid = firstMatrix;

    this._steps.push(
      // call prompt
      // check if on the fly
      // if on the fly, ask if continue
      // if not continue -> dislodge all spells, info and stop
      // if continue, roll
      // if roll unsuccessful -> add status "in on-the-fly attunement" to actor, info and stop
      // if successful/not on the fly -> put in matrix

      // do grimoire stuff some other time
    );

  }

}