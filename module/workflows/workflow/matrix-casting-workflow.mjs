import Rollable from "./rollable.mjs";
import ActorWorkflow from "./actor-workflow.mjs";
// import WorkflowInterruptError from "../workflow-interrupt.mjs";

/**
 * @typedef MatrixCastingWorkflowOptions
 * @property {ItemEd} matrix - The matrix being used for casting. Must be attuned to the spell.
 * @property {ItemEd} [spell] - The spell being cast
 */

/**
 * Handles the workflow for casting a spell from a matrix
 */
export default class MatrixCastingWorkflow extends Rollable( ActorWorkflow ) {
/*
  /!**
   * @param {ActorEd} caster - The actor casting the spell
   * @param {MatrixCastingWorkflowOptions} options - Options for the workflow
   *!/
  constructor( caster, options ) {
    super( caster, options );
    this._matrix = options.matrix;

    this._steps.push(
      this.#ensureActiveSpell.bind( this ),
      this.#weaveThreads.bind( this ),
    );
  }

  async #ensureActiveSpell() {
    const activeSpell = await this._matrix.system.getActiveSpell();

    if ( activeSpell.system?.getAttunedMatrix()?.uuid !== this._matrix.uuid ) {
      throw new WorkflowInterruptError(
        this,
        game.i18n.localize( "ED.Notifications.Error.matrixCastingSpellNotAttuned" ),
      );
    }

    this._spell = activeSpell;
  }

  async #weaveThreads() {

  }

  /!**
   * Prepare for spellcasting
   * @override
   *!/
  async preCastSpell() {
    // Matrix casting doesn't need special preparation beyond thread weaving
  }

  /!**
   * Cast the spell using the matrix
   * @override
   *!/
  async castSpell() {
    // Create a spellcasting roll
    const spellcastingRoll = await this.createSpellcastingRoll( { stepModifier: 0 } );

    // Determine success
    const difficultyTarget = this._spell.system.difficulty ||
                           ( this._targets.length > 0 ? this._targets[0].system.defense?.mystic?.value : 0 ) ||
                           this._spell.system.circle + 5;

    const isSuccess = spellcastingRoll.total >= difficultyTarget;

    this._spellcastingResult = {
      roll:             spellcastingRoll,
      success:          isSuccess,
      difficultyTarget: difficultyTarget,
      extraSuccesses:   Math.max( 0, Math.floor( ( spellcastingRoll.total - difficultyTarget ) / 5 ) )
    };

    if ( !isSuccess ) {
      throw new WorkflowInterruptError( this,
        game.i18n.localize( "ED.Notifications.Warn.spellcastingTestFailed" ) );
    }
  }

  /!**
   * Determine the effect of the spell based on the spellcasting result
   * @override
   *!/
  async determineEffect() {
    // Calculate the effect based on the spell's properties and spellcasting result
    this._effectResult = {
      damage:       this.calculateSpellDamage(),
      duration:     this.calculateSpellDuration(),
      range:        this.calculateSpellRange(),
      area:         this.calculateSpellArea(),
      extraEffects: this._spellcastingResult.extraSuccesses > 0
    };
  }

  /!**
   * Calculate the spell's damage if applicable
   * @returns {object|null} Damage information or null if not applicable
   *!/
  calculateSpellDamage() {
    // If the spell does damage, calculate it
    if ( this._spell.system.damage?.does ) {
      const baseDamageStep = this._spell.system.damage?.step || 0;
      const totalDamageStep = baseDamageStep + this._spellcastingResult.extraSuccesses;

      return {
        step:           totalDamageStep,
        extraSuccesses: this._spellcastingResult.extraSuccesses
      };
    }

    return null;
  }

  /!**
   * Calculate the spell's duration
   * @returns {object} Duration information
   *!/
  calculateSpellDuration() {
    const baseDuration = this._spell.system.duration?.base || 0;
    const durationUnit = this._spell.system.duration?.unit || "rounds";
    let totalDuration = baseDuration;

    // Some spells increase duration with extra successes
    if ( this._spell.system.duration?.increasesWithSuccess ) {
      totalDuration += this._spellcastingResult.extraSuccesses * ( this._spell.system.duration?.perSuccess || 1 );
    }

    return {
      value:          totalDuration,
      unit:           durationUnit,
      extraSuccesses: this._spellcastingResult.extraSuccesses
    };
  }

  /!**
   * Calculate the spell's range
   * @returns {object} Range information
   *!/
  calculateSpellRange() {
    const baseRange = this._spell.system.range?.base || 0;
    const rangeUnit = this._spell.system.range?.unit || "yards";
    let totalRange = baseRange;

    // Some spells increase range with extra successes
    if ( this._spell.system.range?.increasesWithSuccess ) {
      totalRange += this._spellcastingResult.extraSuccesses * ( this._spell.system.range?.perSuccess || 5 );
    }

    return {
      value: totalRange,
      unit:  rangeUnit
    };
  }

  /!**
   * Calculate the spell's area of effect
   * @returns {object|null} Area information or null if not applicable
   *!/
  calculateSpellArea() {
    if ( !this._spell.system.area?.does ) return null;

    const baseArea = this._spell.system.area?.base || 0;
    const areaUnit = this._spell.system.area?.unit || "yards";
    let totalArea = baseArea;

    // Some spells increase area with extra successes
    if ( this._spell.system.area?.increasesWithSuccess ) {
      totalArea += this._spellcastingResult.extraSuccesses * ( this._spell.system.area?.perSuccess || 1 );
    }

    return {
      value: totalArea,
      unit:  areaUnit
    };
  }

  /!**
   * Apply any additional effects - for matrix casting, there typically aren't any
   * negative consequences like with raw magic
   * @override
   *!/
  async applyAdditionalEffects() {
    // Matrix casting doesn't typically have additional negative effects
  } */
}

