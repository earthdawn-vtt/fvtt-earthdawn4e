import { rollAttribute } from "./roll-attribute.mjs";

export default class Workflows {
  constructor( actor ) {
    this.actor = actor;
  }

  _workflowMapping = {};

  /**
   * Trigger a specific workflow by name
   * @param {string} type - The type of the triggered workflow.
   * @param inputs
   * @returns {Promise} - Triggers the workflow
   */
  async getWorkflow( type, inputs ) {
    return this._workflowTypeMapping[type]( inputs );
  }

  _workflowTypeMapping = {
    rollAttribute: this._rollAttributeWorkflow.bind( this ),
    // rollAbility: this._rollAbilityWorkflow.bind(this),
    // rollEquipment: this._rollEquipmentWorkflow.bind(this),
    // rollRecovery: this._rollRecoveryWorkflow.bind(this),
  };

  async _rollAttributeWorkflow( inputs ) {
    return rollAttribute( this.actor, inputs.attribute );
  }
}