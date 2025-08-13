import BaseCastingWorkflow from "./base-casting-workflow.mjs";
import { MAGIC, ROLLS, SYSTEM } from "../../config/_module.mjs";
import DialogEd from "../../applications/api/dialog.mjs";
import RollPrompt from "../../applications/global/roll-prompt.mjs";
import WarpingRollOptions from "../../data/roll/warping.mjs";
import DamageRollOptions from "../../data/roll/damage.mjs";
import HorrorMarkRollOptions from "../../data/roll/horror-mark.mjs";

/**
 * @typedef {object} RawCastingWorkflowOptions
 * @property {string} [astralSpacePollution="safe"] - The type of astral space (safe, open, tainted, corrupt)
 * @property {ItemEd} [grimoire] - If provided, the grimoire from which the spell is cast without attuning
 */

/**
 * Handles the workflow for casting a spell using raw magic
 * @augments {BaseCastingWorkflow}
 */
export default class RawCastingWorkflow extends BaseCastingWorkflow {

  /**
   * The type of astral space pollution (safe, open, tainted, corrupt)
   */
  _astralSpacePollution;

  /**
   * The data for the selected astral space pollution type
   * @type {object}
   */
  _pollutionData;

  /**
   * The circle of the spell being cast
   * @type {number}
   */
  _spellCircle;

  /**
   * The roll for the warping test
   * @type {EdRoll}
   */
  _warpingRoll;

  /**
   * The roll for the damage test from warping
   * @type {EdRoll}
   */
  _damageRoll;

  /**
   * The roll for the horror mark test
   * @type {EdRoll}
   */
  _horrorMarkRoll;

  /**
   * Whether the caster suffers raw magic consequences. This is false for horrors and spirits.
   * @type {boolean}
   */
  get _sufferRawConsequences() {
    return ![ "horror", "spirit" ].includes( this._actor.type );
  }

  /**
   * @param {ActorEd} caster - The actor casting the spell
   * @param {WorkflowOptions&BaseCastingWorkflowOptions&RawCastingWorkflowOptions} [options] - Options for the workflow
   */
  constructor( caster, options = {} ) {
    super( caster, options );
    this._astralSpacePollution = options.astralSpacePollution;
    this._spellCircle = this._spell.system.level;
  }

  /** @override */
  async _postCastSpell() {
    await super._postCastSpell();

    if ( !this._sufferRawConsequences ) return;

    await this._determineAstralSpacePollution();

    await this._handleAftermath();
  }

  /**
   * Determine the type of astral space pollution
   * @returns {Promise<void>}
   */
  async _determineAstralSpacePollution() {
    this._astralSpacePollution = game.scenes.active.getFlag( game.system.id, "astralPollution" );

    if ( !this._astralSpacePollution ) {
      this._astralSpacePollution = await DialogEd.waitButtonSelect(
        Object.entries( MAGIC.astralSpacePollution ).map( ( [ key, value ] ) => {
          return {
            action: key,
            label:  value.label,
            icon:   SYSTEM.icons.AstralPollution[ key ],
          };
        } ),
        "ed-button-select-astral-space-pollution",
        {
          title: game.i18n.localize( "ED.Dialogs.Title.selectAstralSpacePollution" ),
        },
      );
    }

    this._astralSpacePollution ??= "safe";
    this._pollutionData = MAGIC.astralSpacePollution[ this._astralSpacePollution ];
  }

  /**
   * Handle the aftermath of casting a spell with raw magic.
   * This includes Warping, Damage, and Horror Mark tests.
   */
  async _handleAftermath() {
    // Perform warping test
    await this._performWarpingTest();

    // If warping test succeeds, perform damage test
    if ( this._warpingRoll?.isSuccess ) {
      await this._performDamageTest();
    }

    // Perform horror mark test if in dangerous astral space
    if ( this._astralSpacePollution !== "safe" ) {
      await this._performHorrorMarkTest();
    }

  }

  /**
   * Perform a warping test
   */
  async _performWarpingTest() {
    const warpingRollOptions = new WarpingRollOptions( {
      astralSpacePollution: this._astralSpacePollution,
      rollingActorUuid:     null,
      casterUuid:           this._actor.uuid,
      spellUuid:            this._spell.uuid,
      caster:               this._actor,
      spell:                this._spell,
    } );

    this._warpingRoll = await RollPrompt.waitPrompt( warpingRollOptions );
    if ( !this._warpingRoll ) {
      this.cancel();
      return;
    }
    await this._warpingRoll.toMessage();
  }

  /**
   * Perform a damage test from raw magic
   */
  async _performDamageTest() {
    const damageRollOptions = new DamageRollOptions( {
      step: {
        base:      this._spellCircle,
        modifiers: {
          [ this._pollutionData.label ]: this._pollutionData.rawMagic.damageModifier,
        },
      },
      damageSource:     ROLLS.rollTypes.warping.label,
      armorType:        "mystical",
      damageType:       "standard",
      ignoreArmor:      false,
      naturalArmorOnly: true,
    } );

    this._damageRoll = await RollPrompt.waitPrompt( damageRollOptions );
    if ( !this._damageRoll ) {
      this.cancel();
      return;
    }

    this._damageRoll.toMessage();
  }

  /**
   * Perform a horror mark test
   */
  async _performHorrorMarkTest() {
    const horrorMarkRollOptions = new HorrorMarkRollOptions( {
      casterUuid:           this._actor.uuid,
      caster:               this._actor,
      spellUuid:            this._spell.uuid,
      spell:                this._spell,
      astralSpacePollution: this._astralSpacePollution,
    } );

    this._horrorMarkRoll = await RollPrompt.waitPrompt( horrorMarkRollOptions );
    if ( !this._horrorMarkRoll ) {
      this.cancel();
      return;
    }
    await this._horrorMarkRoll.toMessage(
      {},
      {
        rollMode: "blindroll"
      },
    );
  }

  /**
   * Get the complete result of this casting workflow
   * @returns {object} The complete casting result
   */
  async _setResult() {
    await super._setResult();
    this._result.astralSpacePollution = this._astralSpacePollution;
  }

}
