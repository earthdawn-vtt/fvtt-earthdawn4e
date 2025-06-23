import WorkflowInterruptError from "../workflow-interrupt.mjs";
import RawCastingWorkflow from "./raw-casting-workflow.mjs";
import GrimoireCastingWorkflow from "./grimoire-casting-workflow.mjs";
import MatrixCastingWorkflow from "./matrix-casting-workflow.mjs";
import DialogEd from "../../applications/api/dialog.mjs";
import ActorWorkflow from "./actor-workflow.mjs";
import Rollable from "./rollable.mjs";
import AttuneMatrixWorkflow from "./attune-matrix-workflow.mjs";
import AttuneGrimoireWorkflow from "./attune-grimoire-workflow.mjs";

/**
 * @typedef {object} SpellcastingWorkflowOptions
 * @property {Item} spell - The spell being cast
 * @property {"raw"|"grimoire"|"matrix"} [castingMethod] - The method used to cast the spell (matrix, grimoire, raw)
 * @property {Actor[]} [targets] - The targets of the spell
 * @property {number} [additionalThreads=0] - Additional threads to weave
 */

/**
 * Base class for all spellcasting workflows
 * @abstract
 */
export default class SpellcastingWorkflow extends Rollable( ActorWorkflow ) {

  static CASTING_WORKFLOW_TYPES = {
    "grimoire": GrimoireCastingWorkflow,
    "matrix":   MatrixCastingWorkflow,
    "raw":      RawCastingWorkflow,
  };

  get _isRawCaster() {
    return [ "dragon", "horror", "spirit" ].includes( this._actor.type );
  }

  get _sufferRawConsequences() {
    return ![ "horror", "spirit" ].includes( this._actor.type );
  }

  /**
   * The spell being cast
   * @type {Item}
   */
  _spell;

  /**
   * The method used to cast the spell (matrix, grimoire, raw)
   * @type {string}
   */
  _castingMethod;

  /**
   * The matrix the spell is attuned to, if applicable
   * @type {Item}
   */
  _matrix;

  /**
   * The targets of the spell
   * @type {Actor[]}
   */
  _targets = [];

  /**
   * Additional threads to weave
   * @type {number}
   */
  _additionalThreads = 0;

  /**
   * Results of thread weaving tests
   * @type {Array}
   */
  _threadWeavingResults = [];

  /**
   * Result of the spellcasting test
   * @type {object}
   */
  _spellcastingResult = null;

  /**
   * The determined effect of the spell
   * @type {object}
   */
  _effectResult = null;

  /**
   * Results of raw magic effects
   * @type {object}
   */
  _rawMagicResults = null;

  /**
   * @override
   * @param {ActorEd} caster The actor casting the spell
   * @param {WorkflowOptions & SpellcastingWorkflowOptions} options Options for the spellcasting workflow
   */
  constructor( caster, options ) {
    super( caster, options );
    this._spell = options.spell;
    this._matrix = options.spell.system.getAttunedMatrix();
    this._targets = options.targets || [];
    this._additionalThreads = options.additionalThreads || 0;
    this._castingMethod = options.castingMethod;

    this._steps.push(
      this.#chooseCastingMethod.bind( this ),
      this.#attuneSpell.bind( this ),
      this.#createCastingWorkflow.bind( this ),
    );
  }

  async #chooseCastingMethod() {
    if ( this._castingMethod ) return;
    if ( this._isRawCaster ) {
      this._castingMethod = "raw";
      return;
    }
    this._castingMethod = await this.#promptCastingMethod();
    if ( !this._castingMethod ) this.cancel();
  }

  async #promptCastingMethod() {
    const buttonClass = "ed-button-select-casting-method";

    const castingMethods = [];
    if (
      this._spell.system.learnedBy( this._actor )
      && this._actor.hasMatrixForSpell( this._spell )
    ) {
      castingMethods.push( {
        action:  "matrix",
        label:   this._matrix
          ? game.i18n.localize( "ED.Dialogs.Buttons.matrixCastingAlreadyAttuned" )
          : game.i18n.localize( "ED.Dialogs.Buttons.matrixCastingToAttune" ),
        icon:    "systems/ed4e/assets/icons/matrix.svg",
        class:   buttonClass,
      } );
    }
    if ( this._spell.system.inActorGrimoires( this._actor ) ) {
      castingMethods.push( {
        action:  "grimoire",
        label:   game.i18n.localize( "ED.Dialogs.Buttons.grimoireCasting" ),
        icon:    "systems/ed4e/assets/icons/grimoire.svg",
        class:   buttonClass,
      } );
    }
    castingMethods.push( {
      action:  "raw",
      label:   game.i18n.localize( "ED.Dialogs.Buttons.rawCasting" ),
      icon:    "systems/ed4e/assets/icons/rawMagic.svg",
      class:   buttonClass,
    } );

    return DialogEd.waitButtonSelect(
      castingMethods,
      buttonClass,
      {
        title: game.i18n.localize( "ED.Dialogs.Title.selectCastingMethod" ),
      }
    );
  }

  async #attuneSpell() {
    if ( ![ "matrix", "grimoire" ].includes( this._castingMethod ) ) return;

    if ( this._castingMethod === "matrix" && !this._matrix ) {
      await this.#handleAttuneMatrix();
    } else if ( this._castingMethod === "grimoire" ) {
      await this.#handleAttuneGrimoire();
    }
  }

  async #handleAttuneGrimoire() {
    try {
      const attuneGrimoire = await DialogEd.confirm( {
        content:     game.i18n.localize( "ED.Dialogs.doYouWantToAttuneGrimoireBeforeCasting" ),
        rejectClose: true
      } );
      if ( attuneGrimoire ) {
        const attuneGrimoireWorkflow = new AttuneGrimoireWorkflow(
          this._actor,
          {
            spell: this._spell
          }
        );
        await attuneGrimoireWorkflow.execute();
      }
    } catch ( promiseRejection ) {
      this.cancel();
    }
  }

  async #handleAttuneMatrix() {
    const attuneMatrixWorkflow = new AttuneMatrixWorkflow( this._actor, {} );
    await attuneMatrixWorkflow.execute();
    this._matrix = this._spell.system.getAttunedMatrix();
    if ( attuneMatrixWorkflow.canceled ) {
      this.cancel();
      return;
    }
    if ( !this._matrix ) {
      throw new WorkflowInterruptError(
        this,
        game.i18n.localize( "ED.Notifications.Error.spellNotAttunedToMatrix" )
      );
    }
  }

  async #createCastingWorkflow() {
    if ( !this._castingMethod ) {
      throw new WorkflowInterruptError(
        this,
        game.i18n.localize( "ED.Notifications.Error.noCastingMethodSelected" )
      );
    }

    const CastingWorkflow = SpellcastingWorkflow.CASTING_WORKFLOW_TYPES[ this._castingMethod ];
    if ( !CastingWorkflow ) {
      throw new Error( `Unknown casting method: ${this._castingMethod}` );
    }

    const castingWorkflow = new CastingWorkflow( this._actor, {
      spell:               this._spell,
      targets:             this._targets,
      additionalThreads:   this._additionalThreads,
      matrix:              this._matrix,
    } );

    await castingWorkflow.execute();

    // Store results from the casting workflow
    this._threadWeavingResults = castingWorkflow.threadWeavingResults;
    this._spellcastingResult = castingWorkflow.spellcastingResult;
    this._effectResult = castingWorkflow.effectResult;
    this._rawMagicResults = castingWorkflow.rawMagicResults;

    // Finalize the workflow
    await this.finalizeWorkflow();
  }

  /**
   * Creates a spellcasting roll
   * @param {object} options - Options for the spellcasting roll
   * @param {number} [options.stepModifier] - Modifier to the spellcasting step
   * @returns {Promise<EdRoll>} The resulting roll
   */
  async createSpellcastingRoll( options = {} ) {
    const { stepModifier = 0 } = options;

    // Get the spellcasting talent step from the caster
    const spellcastingTalent = this._actor.items.find( i =>
      i.type === "talent" && i.name.includes( "Spellcasting" ) );

    if ( !spellcastingTalent ) {
      throw new WorkflowInterruptError( this,
        game.i18n.localize( "ED.Notifications.Warn.spellcastingNoSpellcasting" ) );
    }

    const baseStep = spellcastingTalent.system.step || 0;
    const totalStep = baseStep + stepModifier;

    // Create the roll options
    const rollOptions = {
      step: {
        base:      baseStep,
        modifiers: { modifier: stepModifier },
        total:     totalStep
      },
      testType: "spellCasting",
      rollType: "spellCasting",
      actor:    this._actor,
      item:     this._spell
    };

    // Create and evaluate the roll
    const roll = new EdRoll( rollOptions );
    await roll.evaluate( { async: true } );

    return roll;
  }

  /**
   * Determine the effect of the spell
   * @returns {Promise<void>}
   */
  async determineEffect() {
    // Determine spell effect and duration
    // Base implementation - subclasses may override or extend
  }

  /**
   * Apply any additional effects based on casting method
   * @abstract
   * @returns {Promise<void>}
   */
  async applyAdditionalEffects() {
    // To be implemented by subclasses
  }

  /**
   * Finalize the workflow and set the result
   * @returns {Promise<void>}
   */
  async finalizeWorkflow() {
    this._result = {
      caster:               this._actor,
      spell:                this._spell,
      targets:              this._targets,
      threadWeavingResults: this._threadWeavingResults,
      spellcastingResult:   this._spellcastingResult,
      effectResult:         this._effectResult,
      additionalEffects:    this._rawMagicResults,
      success:              this._spellcastingResult?.success && this._effectResult
    };
  }
}

