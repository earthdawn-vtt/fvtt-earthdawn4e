export default class WorkflowInterruptError extends Error {

  constructor( workflow, localizedMessage, ...params ) {
    super( ...params );
    this.name = "WorkflowInterruptError";
    this.workflow = workflow;
    this.localizedMessage = localizedMessage;
    this.message ??= `${this.workflow.name} interrupted`;
  }

}