import ActorWorkflow from "./actor-workflow.mjs";
import Rollable from "./rollable.mjs";
import { getSetting } from "../../settings.mjs";

/**
 * @typedef {object} BaseCastingWorkflowOptions
 * @property {ItemEd} spell - The spell being cast
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
  _stopOnWeaving;

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
   * Parameters for the calling of weaveThreads on the spell
   * @see SpellData#weaveThreads
   * @type {[]}
   */
  _weaveThreadsParameters = [];

  /**
   * @param {ActorEd} caster - The actor casting the spell
   * @param {WorkflowOptions&BaseCastingWorkflowOptions} [options] - Options for the workflow
   */
  constructor( caster, options = {} ) {
    if ( new.target === BaseCastingWorkflow ) {
      throw new Error( "CastingWorkflowInterface is an abstract class and cannot be instantiated directly." );
    }
    super( caster, options );
    this._spell = options.spell;
    this._stopOnWeaving = options.stopOnWeaving ?? true;

    this._steps.push(
      this._preWeaveThreads.bind( this ),
      this._weaveThreads.bind( this ),
      this._preCastSpell.bind( this ),
      this._castSpell.bind( this ),
      this._postCastSpell.bind( this ),
      this._setResult.bind( this ),
    );
  }

  /**
   * Prepare for thread weaving
   * @returns {Promise<void>}
   */
  async _preWeaveThreads() {
    this._threadWeavingAbility = this._actor.getThreadWeavingByCastingType( this._spell.system.spellcastingType );
    this._weaveThreadsParameters.push( this._threadWeavingAbility, );
  }

  /**
   * Weave threads for the spell
   * @returns {Promise<void>}
   */
  async _weaveThreads() {
    if ( this._spell.system.isWeavingComplete ) return;

    this._threadWeavingRoll = await this._spell.system.weaveThreads(
      ...this._weaveThreadsParameters,
    );

    if ( this._stopOnWeaving || !this._spell.system.isWeavingComplete ) {
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
   * Handle any aftermath of the casting (raw magic, etc.)
   * @returns {Promise<void>}
   */
  async _postCastSpell() {
    // Do nothing by default
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

