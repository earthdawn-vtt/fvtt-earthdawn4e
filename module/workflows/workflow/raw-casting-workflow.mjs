import Workflow from "./workflow.mjs";
import Rollable from "./rollable.mjs";

/**
 * @typedef {import("./spellcasting-workflow.mjs").SpellcastingWorkflowOptions} SpellcastingWorkflowOptions
 */

/**
 * Handles the workflow for casting a spell using raw magic
 * @implements {BaseCastingWorkflow}
 */
export default class RawCastingWorkflow extends Rollable( Workflow ) {
  /* /!**
   * The type of astral space (safe, open, tainted, corrupt)
   * @type {string}
   *!/
  _astralSpaceType = "safe";

  /!**
   * @param {SpellcastingWorkflowOptions} options
   *!/
  constructor( options = {} ) {
    // Ensure casting method is set to raw
    options.castingMethod = "raw";
    super( options );

    // Raw casting specific properties
    this._astralSpaceType = this._rawData?.astralSpaceType || "safe";
  }

  // region Properties

  get astralSpaceType() { return this._astralSpaceType; }

  // endregion

  /!**
   * Prepare for thread weaving
   * Raw casting doesn't require special preparation
   * @override
   *!/
  async preWeaveThreads() {
    // Warn the caster about the dangers of raw magic
    console.log( `Casting with raw magic in ${this._astralSpaceType} astral space. This may result in harmful effects.` );
  }

  /!**
   * Weave threads for the spell
   * @override
   *!/
  async weaveThreads() {
    const requiredThreads = this._spell.system.threads?.required || 0;
    const totalThreads = requiredThreads + this._additionalThreads;

    if ( totalThreads <= 0 ) {
      return;
    }

    // Handle thread weaving for each required thread
    for ( let i = 0; i < totalThreads; i++ ) {
      // Create a thread weaving roll
      const threadWeavingRoll = await this.createThreadWeavingRoll( { stepModifier: 0 } );

      // Determine success based on the roll result vs difficulty
      const difficultyTarget = this._spell.system.threadDifficulty || this._spell.system.circle + 5;
      const isSuccess = threadWeavingRoll.total >= difficultyTarget;

      const threadWeavingResult = {
        roll:             threadWeavingRoll,
        success:          isSuccess,
        threadIndex:      i,
        difficultyTarget: difficultyTarget
      };

      this._threadWeavingResults.push( threadWeavingResult );

      // If thread weaving fails, the workflow is interrupted
      if ( !isSuccess ) {
        throw new WorkflowInterruptError( this,
          game.i18n.format( "ED.Notifications.Warn.spellcastingThreadWeavingFailed", {
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
    // Raw casting doesn't need special preparation beyond thread weaving
  }

  /!**
   * Cast the spell using raw magic
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
   * Apply additional effects for raw magic casting
   * This includes Warping, Damage, and Horror Mark tests
   * @override
   *!/
  async applyAdditionalEffects() {
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
    const warpingStep = warpingSteps[this._astralSpaceType] || spellCircle;
    const warpingResult = await this._performWarpingTest( warpingStep );

    // If warping test succeeds, perform damage test
    let damageResult = null;
    if ( warpingResult.success ) {
      const damageStep = damageSteps[this._astralSpaceType] || ( spellCircle + 4 );
      damageResult = await this._performDamageTest( damageStep );
    }

    // Perform horror mark test if in dangerous astral space
    let horrorMarkResult = null;
    if ( this._astralSpaceType !== "safe" ) {
      const horrorMarkStep = horrorMarkSteps[this._astralSpaceType] || 0;
      if ( horrorMarkStep > 0 ) {
        horrorMarkResult = await this._performHorrorMarkTest( horrorMarkStep );
      }
    }

    this._rawMagicResults = {
      astralSpaceType: this._astralSpaceType,
      warping:         warpingResult,
      damage:          damageResult,
      horrorMark:      horrorMarkResult
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
/*
  /!**
   * Additional results specific to raw magic
   * @type {object}
   *!/
  _aftermathResults = null;

  /!**
   * @param {SpellcastingWorkflowOptions} options
   *!/
  constructor( options = {} ) {
    // Ensure casting method is set to raw
    options.castingMethod = "raw";
    super( options );

    // Raw casting specific properties
    this._astralSpaceType = this._rawData?.astralSpaceType || "safe";
  }

  /!**
   * Execute the full workflow for raw casting
   * @returns {Promise<object>} The result of the casting
   *!/
  async execute() {
    try {
      await this._preWeaveThreads();
      await this._weaveThreads();
      await this.preCastSpell();
      await this._castSpell();
      await this._applyEffect();
      await this._handleAftermath();
      return this._setResult();
    } catch ( error ) {
      console.error( "Raw casting workflow error:", error );
      throw error;
    }
  }

  /!**
   * Prepare for thread weaving
   * Raw casting doesn't require special preparation
   * @override
   *!/
  async preWeaveThreads() {
    // Warn the caster about the dangers of raw magic
    console.log( `Casting with raw magic in ${this._astralSpaceType} astral space. This may result in harmful effects.` );
  }

  /!**
   * Weave threads for the spell
   * @override
   *!/
  async weaveThreads() {
    const requiredThreads = this._spell.system.threads?.required || 0;
    const totalThreads = requiredThreads + this._additionalThreads;

    if ( totalThreads <= 0 ) {
      return;
    }

    // Handle thread weaving for each required thread
    for ( let i = 0; i < totalThreads; i++ ) {
      // Create a thread weaving roll
      const threadWeavingRoll = await this.createThreadWeavingRoll( { stepModifier: 0 } );

      // Determine success based on the roll result vs difficulty
      const difficultyTarget = this._spell.system.threadDifficulty || this._spell.system.circle + 5;
      const isSuccess = threadWeavingRoll.total >= difficultyTarget;

      const threadWeavingResult = {
        roll:             threadWeavingRoll,
        success:          isSuccess,
        threadIndex:      i,
        difficultyTarget: difficultyTarget
      };

      this._threadWeavingResults.push( threadWeavingResult );

      // If thread weaving fails, the workflow is interrupted
      if ( !isSuccess ) {
        throw new WorkflowInterruptError( this,
          game.i18n.format( "ED.Notifications.Warn.spellcastingThreadWeavingFailed", {
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
    // Raw casting doesn't need special preparation beyond thread weaving
  }

  /!**
   * Cast the spell using raw magic
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
   * Apply the spell effect
   * @returns {Promise<object>} The effect result
   *!/
  async applyEffect() {
    // Implementation for applying the spell effect
    this._effectResult = {
      targets: this._targets,
      effect:  "Applied spell effect" // Placeholder for actual effect logic
    };
    return this._effectResult;
  }

  /!**
   * Handle aftermath of raw casting (strain, feedback, etc.)
   * @returns {Promise<object>} The aftermath results
   *!/
  async handleAftermath() {
    if ( !this._sufferRawConsequences ) return null;

    // Calculate and apply raw magic consequences
    const consequenceRoll = await this.roll( {
      actor:        this._actor,
      attribute:    "willpower",
      stepModifier: 0
    } );

    this._aftermathResults = {
      roll:         consequenceRoll,
      consequences: this._determineRawConsequences( consequenceRoll )
    };

    return this._aftermathResults;
  }

  /!**
   * Determine consequences of raw casting based on roll
   * @private
   * @param {Roll} roll The roll result
   * @returns {object} The consequences
   *!/
  _determineRawConsequences( roll ) {
    // Placeholder for actual consequence determination logic
    return {
      strain:   Math.max( 1, this._spell.system.circle ),
      feedback: roll.total < 10
    };
  }

  /!**
   * Get the complete result of this casting workflow
   * @returns {object} The complete casting result
   *!/
  getResult() {
    return {
      threadWeavingResults: this._threadWeavingResults || [],
      spellcastingResult:   this._spellcastingResult || null,
      effectResult:         this._effectResult || null,
      aftermathResults:     this._aftermathResults || null,
      castingMethod:        "raw",
      astralSpaceType:      this._astralSpaceType
    };
  } */
}
