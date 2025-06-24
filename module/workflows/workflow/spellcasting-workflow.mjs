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
      this.#executeCastingWorkflow.bind( this ),
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

    this._CastingWorkflow = SpellcastingWorkflow.CASTING_WORKFLOW_TYPES[ this._castingMethod ];
  }

  async #executeCastingWorkflow() {
    if ( !this._CastingWorkflow ) {
      throw new Error( `Unknown casting method: ${this._castingMethod}` );
    }

    // Create the specialized casting workflow
    const castingWorkflow = new this._CastingWorkflow( this._actor, {
      spell:             this._spell,
      matrix:            this._matrix,
    } );

    try {
      this._result = await castingWorkflow.execute();
    } catch ( error ) {
      console.error( `Error in ${this._castingMethod} casting workflow:`, error );
      if ( error instanceof WorkflowInterruptError ) {
        throw error; // Re-throw workflow interruptions
      } else {
        throw new WorkflowInterruptError(
          this,
          game.i18n.format( "ED.Notifications.Error.spellcastingWorkflowFailed", {
            error: error.message
          } )
        );
      }
    }
  }
}
