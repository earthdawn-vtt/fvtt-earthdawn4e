/**
 * @typedef {object} WorkflowOptions
 * @property {string} [name] The name of the workflow.
 */

import WorkflowInterruptError from "../workflow-interrupt.mjs";

/**
 * Base class for all workflows. A workflow is a collection of tasks that are executed in sequence. The may depend on
 * each other, or they may be independent. The workflow itself may have one or more targets that are affected by the
 * tasks.
 * @abstract
 */
export default class Workflow {

  /**
   * The current step in the workflow, pointing to the current task.
   * @type {number}
   */
  _currentStep = 0;

  /**
   * The name of the workflow. Defaults to the name of the class.
   * @type {string}
   */
  _name;

  /**
   * The options for this workflow.
   * @type {object}
   */
  _options;

  /**
   * The result of the workflow. Must be set in the subclass during execution.
   * @type {any}
   */
  _result;

  /**
   * The tasks that make up this workflow.
   * @type {Array<function() : Promise<any>>}
   */
  _steps = [];

  /**
   * Whether the workflow has been canceled.
   * @type {boolean}
   */
  _canceled = false;

  /**
   * @param {WorkflowOptions}  [options] The options for this workflow.
   */
  constructor( options = {} ) {
    if ( new.target === Workflow ) {
      throw new TypeError( "Cannot instantiate an abstract class (Workflow) directly." );
    }
    this._options = options;
    this._name = options.name || this.constructor.name;
  }

  // region Properties

  get name() {
    return this._name;
  }

  /**
   * Whether the workflow is canceled.
   * @type {boolean}
   * @readonly
   */
  get canceled() {
    return this._canceled;
  }

  get result() {
    return this._result;
  }

  // endregion

  /**
   * Cancel the workflow execution silently without throwing an error.
   * This allows steps to signal that the workflow should stop but
   * without being treated as an error condition.
   */
  cancel() {
    this._canceled = true;
  }

  /**
   * Execute the workflow.
   * @returns {Promise<typeof _result>} The result of the workflow, which is defined by the subclass, or
   * undefined if the workflow was interrupted or canceled.
   */
  async execute() {
    try {
      while ( this._currentStep < this._steps.length ) {
        const step = this._steps[this._currentStep];
        await step();
        this._currentStep++;
        
        // Check if the workflow was canceled during the step execution
        if ( this._canceled ) {
          return undefined;
        }
      }
    } catch ( e ) {
      if ( e instanceof WorkflowInterruptError ) {
        ui.notifications.warn( e.localizedMessage ?? e.message );
        return undefined;
      } else {
        throw e;
      }
    }

    return this._result;
  }

}