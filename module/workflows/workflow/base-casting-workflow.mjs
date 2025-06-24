import ActorWorkflow from "./actor-workflow.mjs";
import Rollable from "./rollable.mjs";
import { getSetting } from "../../settings.mjs";

/**
 * @typedef {object} BaseCastingWorkflowOptions
 * @property {boolean} [stopOnWeaving=true] - Whether to stop the workflow after thread weaving is required
 */

/**
 * An interface that defines the contract all specialized casting workflows must implement.
 * Formalizes the expected methods and properties for any workflow that
 * handles a specific casting method.
 * @abstract
 */
export default class BaseCastingWorkflow extends Rollable( ActorWorkflow ) {

  /**
   * The spell being cast
   * @type {ItemEd}
   */
  _spell;

  /**
   * The ability used for spellcasting
   * @type {ItemEd}
   */
  _spellcastingAbility;

  /**
   * The roll made for spellcasting
   * @type {EdRoll}
   */
  _spellcastingRoll;

  /**
   * Whether to stop the workflow after thread weaving is required
   * @type {boolean}
   */
  _stopOnWeaving = true;

  /**
   * The ability used for thread weaving
   * @type {ItemEd}
   */
  _threadWeavingAbility;

  /**
   * The roll made for weaving threads, if needed
   * @type {EdRoll}
   */
  _threadWeavingRoll;

  /**
   * @param {ActorEd} caster - The actor casting the spell
   * @param {WorkflowOptions&BaseCastingWorkflowOptions} [options] - Options for the workflow
   */
  constructor( caster, options = {} ) {
    if ( new.target === BaseCastingWorkflow ) {
      throw new Error( "CastingWorkflowInterface is an abstract class and cannot be instantiated directly." );
    }
    super( caster, options );
    this.stopOnWeaving = options.stopOnWeaving ?? true;
  }

  /**
   * Prepare for thread weaving
   * @returns {Promise<void>}
   */
  async _preWeaveThreads() {
    this._threadWeavingAbility = this._actor.getThreadWeavingByCastingType( this._spell.system.spellcastingType );
  }

  /**
   * Weave threads for the spell
   * @returns {Promise<void>}
   */
  async _weaveThreads() {
    if ( this._spell.system.isWeavingComplete ) return;

    this._threadWeavingRoll = await this._spell.system.weaveThreads(
      this._threadWeavingAbility,
      this._matrix,
    );

    if ( this._stopOnWeaving ) {
      this.cancel();
    }
  }

  /**
   * Prepare for spellcasting
   * @returns {Promise<void>}
   */
  async _preCastSpell() {
    this._spellcastingAbility = this._actor.getSingleItemByEdid(
      getSetting( "edidSpellcasting" )
    );
  }

  /**
   * Perform the spellcasting test
   * @returns {Promise<void>}
   */
  async _castSpell() {
    this._spellcastingRoll = await this._spell.system.cast(
      this._actor,
      this._spellcastingAbility,
    );
  }

  /**
   * Handle any aftermath of the casting (drain, feedback, etc.)
   * @abstract
   * @returns {Promise<void>}
   */
  async _handleAftermath() {
    throw new Error( "Method 'handleAftermath()' must be implemented by derived classes" );
  }

  /**
   * Sets the final result of the casting
   * @returns {object} The complete casting result
   */
  async _setResult() {
    this._result = {
      _threadWeavingRoll: this._threadWeavingRoll,
      _spellcastingRoll:  this._spellcastingRoll,
    };
    return this._result;
  }
}

