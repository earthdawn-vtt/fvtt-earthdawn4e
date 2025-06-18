import ActorWorkflow from "./actor-workflow.mjs";
import RecoveryRollOptions from "../../data/roll/recovery.mjs";
import ED4E from "../../config/_module.mjs";
import WorkflowInterruptError from "../workflow-interrupt.mjs";
import Rollable from "./rollable.mjs";
import RollProcessor from "../../services/roll-processor.mjs";


/**
 * @typedef {object} RecoveryWorkflowOptions
 * @property {import("../../config/workflows.mjs").recoveryModes} [recoveryMode="recovery"] The type of recovery to perform
 */

/**
 * Workflow for handling actor recovery tests, including standard recovery, full rest, and stun recovery
 */
export default class RecoveryWorkflow extends Rollable( ActorWorkflow ) {

  /**
   * The characteristics system fields of the actor performing the recovery
   * @type {object}
   * @private
   */
  _actorCharacteristics;

  /**
   * The type of recovery being performed
   * @type {RecoveryWorkflowOptions.recoveryModes}
   * @private
   */
  _recoveryMode;

  /**
   * Is the recovery mode a standard recovery?
   * @type {boolean}
   * @private
   */
  get _isRecovery() {
    return this._recoveryMode === "recovery";
  }

  /**
   * Is the recovery mode a full rest?
   * @type {boolean}
   * @private
   */
  get _isFullRest() {
    return this._recoveryMode === "fullRest";
  }

  /**
   * Is the recovery mode a stun recovery?
   * @type {boolean}
   * @private
   */
  get _isStunRecovery() {
    return this._recoveryMode === "recoverStun";
  }

  /**
   * The {@link EdRollOptions} for the recovery roll.
   * @type {EdRollOptions}
   * @private
   */
  _rollOptions;

  /**
   * The roll being performed for recovery.
   * @type {EdRoll}
   * @private
   */
  _roll;

  /**
   * @param {ActorEd} actor The actor performing the recovery
   * @param {RecoveryWorkflowOptions} [options] Options for the recovery workflow
   */
  constructor( actor, options = {} ) {
    super( actor, options );

    this._recoveryMode = options.recoveryMode || "recovery";
    this._actorCharacteristics = actor.system.characteristics;

    this._steps = [
      this._validateRecovery.bind( this ),
      this._prepareRecoveryRollOptions.bind( this ),
      this._performRecoveryRoll.bind( this ),
      this._processRecovery.bind( this ),
      this._rollToChat.bind( this ),
    ];
  }

  /**
   * Validates that recovery is needed and possible based on the recovery mode
   * @returns {Promise<void>}
   * @private
   */
  async _validateRecovery() {
    if ( !( this._recoveryMode in ED4E.WORKFLOWS.recoveryModes ) ) {
      throw new WorkflowInterruptError(
        this,
        game.i18n.localize( "ED4E.Notifications.Warn.invalidRecoveryMode" ),
      );
    }

    if (
      ( this._isRecovery || this._isStunRecovery )
      && !this._actor.hasDamage( "standard" )
    ) {
      ui.notifications.info( game.i18n.localize( "ED4E.Notifications.Info.noDamageNoRecoveryNeeded" ) );
      this.cancel();
      return;

    }

    if (
      this._isStunRecovery
      && !this._actor.hasDamage( "stun" )
    ) {
      ui.notifications.info( game.i18n.localize( "ED4E.Notifications.Info.noDamageNoRecoveryNeeded" ) );
      this.cancel();
      return;
    }

    if (
      this._isFullRest
      && !this._actor.hasDamage( "standard" )
      && !this._actor.hasWounds( "standard" )
    ) {
      ui.notifications.info( game.i18n.localize( "ED4E.Notifications.Info.noFullRestRecoveryNeeded" ) );
      this.cancel();
      return;
    }

    if ( this._actorCharacteristics.recoveryTestsResource.value < 1 ) {
      ui.notifications.warn( game.i18n.localize( "ED4E.Notifications.Warn.noRecoveryTestsAvailable" ) );
      this.cancel();
    }
  }

  /**
   * Prepares the recovery roll options
   * @returns {Promise<void>}
   * @private
   */
  async _prepareRecoveryRollOptions() {
    if ( this._isFullRest && !this._actor.hasDamage( "standard" ) ) {
      ui.notifications.info(
        game.i18n.localize( "ED4E.Notifications.Info.noDamageNoFullRestRecoveryNeeded" )
      );
      this._rollOptions = null;
      this._roll = null;
      return;
    }

    const stepModifiers = {};
    const recoveryModifier = this._actor.system.globalBonuses?.allRecoveryTests.value ?? 0;
    if ( recoveryModifier ) {
      stepModifiers[ED4E.EFFECTS.globalBonuses.allRecoveryTests.label] = recoveryModifier;
    }
    if ( this._isStunRecovery && this._actorCharacteristics.recoveryTestsResource.stunRecoveryAvailable ) {
      // "ED.Rolls.Recovery.stunModifierWillpower"
      stepModifiers[ game.i18n.localize(
        "The Keys of the modifiers object get expanded by period right now shit"
      ) ] = this._actor.system.attributes.wil.step;
    }

    this._rollOptions = RecoveryRollOptions.fromActor(
      {
        recoveryMode: this._recoveryMode,
        ignoreWounds: false, // TODO: Implement ignore wounds option
        step:         {
          base:      this._actorCharacteristics.recoveryTestsResource.step,
          modifiers: stepModifiers,
        },
        chatFlavor: game.i18n.format(
          "ED4E.Chat.Flavor.rollRecovery",
          {
            sourceActor: this._actor.name,
            step:        this._actorCharacteristics.recoveryTestsResource.step,
          // TODO: Edit localization to not use step, but recovery mode
          },
        ),
      },
      this._actor,
    );
  }

  /**
   * Performs the recovery roll
   * @returns {Promise<void>}
   * @private
   */
  async _performRecoveryRoll() {
    if ( this._roll === null ) {
      this._roll = null;
      this._result = null;
      return;
    }

    await this._createRoll();
    await this._roll.evaluate();
    this._result = this._roll;
  }

  /**
   * Processes the recovery based on the roll result and recovery mode
   * @returns {Promise<void>}
   * @private
   */
  async _processRecovery() {
    let availableRecoveryTests = this._actorCharacteristics.recoveryTestsResource.value;
    let stunRecoveryAvailable = this._actorCharacteristics.recoveryTestsResource.stunRecoveryAvailable;
    let damageStandard = this._actorCharacteristics.health.damage.standard;
    let damageStun = this._actorCharacteristics.health.damage.stun;
    let wounds = this._actorCharacteristics.health.wounds;
    let healing = 0;

    if ( this._isFullRest ) {
      stunRecoveryAvailable = true;
      availableRecoveryTests = this._actorCharacteristics.recoveryTestsResource.max;
      if ( this._canHealWound( availableRecoveryTests ) ) {
        wounds = Math.max( wounds - 1, 0 );
        availableRecoveryTests -= 1;
      }
    }

    if ( this._roll ) {
      // Healing is the total of the roll minus any wounds, or at least 1
      healing = Math.max(
        this._roll.total - ( this._roll.options.ignoreWounds ? 0 : wounds ),
        1
      );
    }

    if ( this._isStunRecovery ) {
      stunRecoveryAvailable = false;
      damageStun = Math.max( damageStun - healing, 0 );
      availableRecoveryTests -= 1;
    }

    if (
      this._isRecovery
      || ( this._isFullRest && this._actor.hasDamage( "standard" ) )
    ) {
      const healingLeft = Math.max( healing - damageStandard, 0 );
      damageStandard = Math.max( damageStandard - healing, 0 );
      damageStun = Math.max( damageStun - healingLeft, 0 );
      availableRecoveryTests -= 1;
    }

    await RollProcessor.process( this._roll, this._actor, { rollToMessage: false, } );

    await this._actor.update( {
      "system.characteristics": {
        "recoveryTestsResource": {
          "value":                 availableRecoveryTests,
          "stunRecoveryAvailable": stunRecoveryAvailable,
        },
        "health":                {
          "damage": {
            "standard": damageStandard,
            "stun":     damageStun,
          },
          "wounds": wounds,
        },
      },
    } );
  }

  _canHealWound( availableRecoveryTests ) {
    return !this._actor.hasDamage( "standard" )
      && this._actor.hasWounds( "standard" )
      && availableRecoveryTests > 0;
  }
}
