/**
 * Error class used to interrupt a workflow.
 */
export default class WorkflowInterruptError extends Error {

  /**
   * @param {Workflow} workflow  The workflow that was interrupted.
   * @param {string} localizedMessage    The localized message to display.
   * @param {...*} params                Additional parameters for the Error constructor.
   */
  constructor( workflow, localizedMessage, ...params ) {
    super( ...params );
    this.name = "WorkflowInterruptError";
    this.workflow = workflow;
    this.localizedMessage = localizedMessage;
    this.message ??= `${this.workflow.name} interrupted`;
  }

}