import WorkflowInterruptError from "../workflow-interrupt.mjs";
import BaseCastingWorkflow from "./base-casting-workflow.mjs";

/**
 * @typedef MatrixCastingWorkflowOptions
 * @property {ItemEd} matrix - The matrix being used for casting. Must be attuned to the spell.
 * @property {ItemEd} [spell] - The spell being cast
 */

/**
 * Handles the workflow for casting a spell from a matrix
 */
export default class MatrixCastingWorkflow extends BaseCastingWorkflow {

  /**
   * The matrix being used for casting
   * @type {ItemEd}
   */
  _matrix;

  /**
   * @param {ActorEd} caster - The actor casting the spell
   * @param {MatrixCastingWorkflowOptions} options - Options for the workflow
   */
  constructor( caster, options ) {
    super( caster, options );
    this._matrix = options.matrix;
  }

  /** @inheritDoc */
  async _preWeaveThreads() {
    const activeSpell = await this._matrix.system.getActiveSpell();

    if ( activeSpell?.system?.getAttunedMatrix()?.uuid !== this._matrix.uuid ) {
      throw new WorkflowInterruptError(
        this,
        game.i18n.localize( "ED.Notifications.Error.matrixCastingSpellNotAttuned" ),
      );
    }

    this._spell = activeSpell;

    await super._preWeaveThreads();

    this._weaveThreadsParameters.push( { matrix: this._matrix, } );
  }

}

