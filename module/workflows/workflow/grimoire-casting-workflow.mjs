import BaseCastingWorkflow from "./base-casting-workflow.mjs";

/**
 * @typedef {object} GrimoireCastingWorkflowOptions
 * @property {ItemEd} grimoire - The grimoire from which the spell is cast
 */

/**
 * Handles the workflow for casting a spell from a grimoire
 * @augments BaseCastingWorkflow
 */
export default class GrimoireCastingWorkflow extends BaseCastingWorkflow {

  /**
   * The grimoire from which the spell is cast
   * @type {ItemEd|null}
   */
  _grimoire;

  /**
   * @param {ActorEd} caster - The actor casting the spell
   * @param {GrimoireCastingWorkflowOptions&BaseCastingWorkflow&WorkflowOptions} [options] - Options for the workflow
   */
  constructor( caster, options = {} ) {
    super( caster, options );
    this._grimoire = options.grimoire;
  }

  async _preCastSpell() {
    super._preCastSpell();
  }

  async _castSpell() {
    super._castSpell();
  }

  async _postCastSpell() {
    super._postCastSpell();
  }

  async _setResult() {
    return super._setResult();
  }
}
