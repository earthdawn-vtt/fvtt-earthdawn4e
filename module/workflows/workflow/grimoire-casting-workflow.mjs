import BaseCastingWorkflow from "./base-casting-workflow.mjs";

/**
 * @typedef {import("./spellcasting-workflow.mjs").SpellcastingWorkflowOptions} SpellcastingWorkflowOptions
 */

/**
 * Handles the workflow for casting a spell from a grimoire
 * @augments BaseCastingWorkflow
 */
export default class GrimoireCastingWorkflow extends BaseCastingWorkflow {

  constructor() {
    super();
    throw new Error( "RawCastingWorkflow: Not implemented yet." );
  }

  /* /!**
   * @param {SpellcastingWorkflowOptions} options
   *!/
  constructor( options = {} ) {
    // Ensure casting method is set to grimoire
    options.castingMethod = "grimoire";
    super( options );
  }

  /!**
   * Prepare for thread weaving by validating the grimoire
   * @override
   *!/
  async preWeaveThreads() {
    this.validateGrimoire();

    // If the grimoire is not attuned, the caster can still proceed but may suffer raw magic effects
    if ( !this._grimoireData?.isAttuned ) {
      console.log( "Grimoire is not attuned. Casting will proceed but may result in raw magic effects." );
    }
  }

  /!**
   * Validate that the grimoire contains the spell
   *!/
  validateGrimoire() {
    const grimoire = this._grimoireData?.grimoire;

    if ( !grimoire ) {
      throw new WorkflowInterruptError( this,
        game.i18n.localize( "" ) );
    }

    // Check if the grimoire contains the spell
    // This would depend on how grimoires are implemented in the system
    const grimoireSpells = grimoire.system.spells || [];
    const grimoireContainsSpell = grimoireSpells.some( s =>
      s.id === this._spell.id || s.name === this._spell.name
    );

    if ( !grimoireContainsSpell ) {
      throw new WorkflowInterruptError( this,
        game.i18n.format( "", {
          spell: this._spell.name
        } ) );
    }
  }

  /!**
   * Weave threads for the spell
   * @override
   *!/
  async weaveThreads() {
    const requiredThreads = this._spell.system.threads?.required || 0;
    const totalThreads = requiredThreads + this._additionalThreads;
    const isOwnGrimoire = this._grimoireData?.isOwnGrimoire || false;

    if ( totalThreads <= 0 ) {
      return;
    }

    // For non-own grimoires, there's a -2 penalty to Thread Weaving
    const threadWeavingPenalty = isOwnGrimoire ? 0 : -2;

    // Handle thread weaving for each required thread
    for ( let i = 0; i < totalThreads; i++ ) {
      // Create a thread weaving roll with the appropriate penalty
      const threadWeavingRoll = await this.createThreadWeavingRoll( { stepModifier: threadWeavingPenalty } );

      // Determine success based on the roll result vs difficulty
      const difficultyTarget = this._spell.system.threadDifficulty || this._spell.system.circle + 5;
      const isSuccess = threadWeavingRoll.total >= difficultyTarget;

      const threadWeavingResult = {
        roll:             threadWeavingRoll,
        success:          isSuccess,
        threadIndex:      i,
        difficultyTarget: difficultyTarget,
        penalty:          threadWeavingPenalty
      };

      this._threadWeavingResults.push( threadWeavingResult );

      // If thread weaving fails, the workflow is interrupted
      if ( !isSuccess ) {
        throw new WorkflowInterruptError( this,
          game.i18n.format( "", {
            threadNumber: i + 1
          } ) );
      }
    }
  }

  /!**
   * Prepare for spellcasting
   * @override
   *!/
  async preCastSpell() {
    // Grimoire casting doesn't need special preparation beyond thread weaving
  }

  /!**
   * Cast the spell using the grimoire
   * @override
   *!/
  async castSpell() {
    const isOwnGrimoire = this._grimoireData?.isOwnGrimoire || false;

    // For non-own grimoires, there's a -2 penalty to Spellcasting
    const spellcastingPenalty = isOwnGrimoire ? 0 : -2;

    // Create a spellcasting roll with the appropriate penalty
    const spellcastingRoll = await this.createSpellcastingRoll( { stepModifier: spellcastingPenalty } );

    // Determine success
    const difficultyTarget = this._spell.system.difficulty ||
                           ( this._targets.length > 0 ? this._targets[0].system.defense?.mystic?.value : 0 ) ||
                           this._spell.system.circle + 5;

    const isSuccess = spellcastingRoll.total >= difficultyTarget;

    this._spellcastingResult = {
      roll:             spellcastingRoll,
      success:          isSuccess,
      difficultyTarget: difficultyTarget,
      penalty:          spellcastingPenalty,
      extraSuccesses:   Math.max( 0, Math.floor( ( spellcastingRoll.total - difficultyTarget ) / 5 ) )
    };

    if ( !isSuccess ) {
      throw new WorkflowInterruptError( this,
        game.i18n.localize( "" ) );
    }
  }

  /!**
   * Determine the effect of the spell
   * If using own grimoire, gain an extra success
   * @override
   *!/
  async determineEffect() {
    const isOwnGrimoire = this._grimoireData?.isOwnGrimoire || false;

    // If using own grimoire, add an extra success
    if ( isOwnGrimoire && this._spellcastingResult.success ) {
      this._spellcastingResult.extraSuccesses += 1;
    }

    // Calculate the effect based on the spell's properties and spellcasting result
    this._effectResult = {
      damage:           this.calculateSpellDamage(),
      duration:         this.calculateSpellDuration(),
      range:            this.calculateSpellRange(),
      area:             this.calculateSpellArea(),
      extraEffects:     this._spellcastingResult.extraSuccesses > 0,
      ownGrimoireBonus: isOwnGrimoire
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
   * Apply any additional effects based on casting method
   * For grimoire casting, if the grimoire is not attuned, apply raw magic effects
   * @override
   *!/
  async applyAdditionalEffects() {
    const isAttuned = this._grimoireData?.isAttuned || false;

    // If the grimoire is attuned, no additional effects
    if ( isAttuned ) {
      return;
    }

    // If not attuned, apply raw magic effects
    // This should be similar to the raw casting workflow
    const astralSpaceType = this._grimoireData?.astralSpaceType || "safe";
    this._rawMagicResults = await this._applyRawMagicEffects( astralSpaceType );
  }

  /!**
   * Apply raw magic effects
   * @param {string} astralSpaceType - The classification of the local astral space
   * @returns {object} The results of the raw magic effects
   * @private
   *!/
  async _applyRawMagicEffects( astralSpaceType ) {
    // This is similar to what would be in the RawCastingWorkflow
    const spellCircle = this._spell.system.circle || 1;

    // Determine warping and damage steps based on astral space type
    const warpingSteps = {
      "safe":    spellCircle,
      "open":    spellCircle + 5,
      "tainted": spellCircle + 10,
      "corrupt": spellCircle + 15
    };

    const damageSteps = {
      "safe":    spellCircle + 4,
      "open":    spellCircle + 8,
      "tainted": spellCircle + 12,
      "corrupt": spellCircle + 16
    };

    const horrorMarkSteps = {
      "safe":    0, // No horror mark in safe space
      "open":    spellCircle + 2,
      "tainted": spellCircle + 5,
      "corrupt": spellCircle + 10
    };

    // Perform warping test
    const warpingStep = warpingSteps[astralSpaceType] || spellCircle;
    const warpingResult = await this._performWarpingTest( warpingStep );

    // If warping test succeeds, perform damage test
    let damageResult = null;
    if ( warpingResult.success ) {
      const damageStep = damageSteps[astralSpaceType] || ( spellCircle + 4 );
      damageResult = await this._performDamageTest( damageStep );
    }

    // Perform horror mark test if in dangerous astral space
    let horrorMarkResult = null;
    if ( astralSpaceType !== "safe" ) {
      const horrorMarkStep = horrorMarkSteps[astralSpaceType] || 0;
      if ( horrorMarkStep > 0 ) {
        horrorMarkResult = await this._performHorrorMarkTest( horrorMarkStep );
      }
    }

    return {
      astralSpaceType,
      warping:    warpingResult,
      damage:     damageResult,
      horrorMark: horrorMarkResult
    };
  }

  /!**
   * Perform a warping test
   * @param {number} warpingStep - The step number for the warping test
   * @returns {object} The result of the warping test
   * @private
   *!/
  async _performWarpingTest( warpingStep ) {
    // Get the caster's mystic defense
    const casterMysticDefense = this._caster.system.defense?.mystic?.value || 0;

    // Create roll options for the warping test
    const rollOptions = {
      step: {
        base:  warpingStep,
        total: warpingStep
      },
      testType: "effect",
      rollType: "warpingTest",
      actor:    null, // No actor for this roll
      target:   {
        base:  casterMysticDefense,
        total: casterMysticDefense
      }
    };

    // Create and evaluate the roll
    const roll = new EdRoll( rollOptions );
    await roll.evaluate( { async: true } );

    // Determine if the warping succeeds (roll >= mystic defense)
    const success = roll.total >= casterMysticDefense;

    return {
      roll:    roll,
      success: success,
      step:    warpingStep,
      target:  casterMysticDefense
    };
  }

  /!**
   * Perform a damage test from raw magic
   * @param {number} damageStep - The step number for the damage test
   * @returns {object} The result of the damage test
   * @private
   *!/
  async _performDamageTest( damageStep ) {
    // Get the caster's mystic armor
    const casterMysticArmor = this._caster.system.armor?.mystic?.value || 0;

    // Create roll options for the damage test
    const rollOptions = {
      step: {
        base:  damageStep,
        total: damageStep
      },
      testType: "effect",
      rollType: "damageTest",
      actor:    null, // No actor for this roll
      damage:   {
        type:       "mystic",
        armorValue: casterMysticArmor
      }
    };

    // Create and evaluate the roll
    const roll = new EdRoll( rollOptions );
    await roll.evaluate( { async: true } );

    // Calculate final damage after armor
    const finalDamage = Math.max( 0, roll.total - casterMysticArmor );

    return {
      roll:        roll,
      step:        damageStep,
      mysticArmor: casterMysticArmor,
      damage:      finalDamage
    };
  }

  /!**
   * Perform a horror mark test
   * @param {number} horrorMarkStep - The step number for the horror mark test
   * @returns {object} The result of the horror mark test
   * @private
   *!/
  async _performHorrorMarkTest( horrorMarkStep ) {
    // Get the caster's mystic defense
    const casterMysticDefense = this._caster.system.defense?.mystic?.value || 0;

    // Create roll options for the horror mark test
    const rollOptions = {
      step: {
        base:  horrorMarkStep,
        total: horrorMarkStep
      },
      testType: "effect",
      rollType: "horrorMarkTest",
      actor:    null, // No actor for this roll
      target:   {
        base:  casterMysticDefense,
        total: casterMysticDefense
      }
    };

    // Create and evaluate the roll
    const roll = new EdRoll( rollOptions );
    await roll.evaluate( { async: true } );

    // Determine if the horror mark test succeeds (roll >= mystic defense)
    const success = roll.total >= casterMysticDefense;

    return {
      roll:    roll,
      success: success,
      step:    horrorMarkStep,
      target:  casterMysticDefense
    };
  } */
}
