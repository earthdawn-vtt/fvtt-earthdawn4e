/**
 * @typedef {object} RollableOptions
 * @property {EdRoll} [roll] The roll to use for this workflow.
 * @property {EdRollOptions} [rollOptions] The options to use for creating rolls.
 */

/**
 * A mixin that adds roll-related functionality to a workflow.
 * This mixin can be applied to any workflow that needs to perform dice rolls.
 * @param {typeof Workflow} WorkflowClass The workflow class to mix into
 * @returns {typeof Workflow} A new class with the Rollable functionality mixed in
 */
export default function Rollable( WorkflowClass ) {
  return class RollableWorkflow extends WorkflowClass {
    /**
     * The roll object associated with this workflow.
     * @type {EdRoll}
     */
    _roll;

    /**
     * The options used to create the roll.
     * @type {EdRollOptions}
     */
    _rollOptions;

    /**
     * Extra roll results (for workflows that may have multiple rolls)
     * @type {Map<string, EdRoll>}
     */
    _extraRolls = new Map();

    /**
     * @param {...any} args The constructor arguments
     */
    constructor( ...args ) {
      super( ...args );

      // Extract roll-related options if provided
      const options = args[args.length - 1] || {};
      if ( options.roll ) this._roll = options.roll;
      if ( options.rollOptions ) this._rollOptions = options.rollOptions;
    }

  };
}
