import ActorWorkflow from "./actor-workflow.mjs";
import RecoveryRollOptions from "../../data/roll/recovery.mjs";
import WorkflowInterruptError from "../workflow-interrupt.mjs";
import Rollable from "./rollable.mjs";
import * as WORKFLOWS from "../../config/workflows.mjs";


/**
 * @typedef {object} RecoveryWorkflowOptions
 * @property {import("../../config/workflows.mjs").recoveryModes} [recoveryMode="recovery"] The type of recovery to perform
 */

/**
 * Workflow for handling actor recovery tests, including standard recovery, full rest, and stun recovery
 * @augments {ActorWorkflow}
 * @mixes Rollable
 */
export default class RecoveryWorkflow extends Rollable( ActorWorkflow ) {

  // region Properties

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

  // endregion

  // region Getters

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

  // endregion

  // region Checkers

  /**
   * Check if a wound can be healed, that is, the actor has no damage and a recovery test resource is available.
   * @param {number} availableRecoveryTests  The number of available recovery tests.
   * @returns {boolean}                       True if a wound can be healed.
   * @protected
   */
  _canHealWound( availableRecoveryTests ) {
    return !this._actor.hasDamage( "standard" )
      && this._actor.hasWounds( "standard" )
      && availableRecoveryTests > 0;
  }

  /**
   * Check if the recovery requires no roll (e.g., full rest with no damage).
   * @returns {boolean} True if no roll is needed.
   * @protected
   */
  _needsNoRoll() {
    return this._isFullRest && !this._actor.hasDamage( "standard" );
  }

  /**
   * Check if the recovery requires a roll.
   * @returns {boolean} True if a roll is needed.
   * @protected
   */
  _needsRoll() {
    return !this._needsNoRoll();
  }

  // endregion

  /**
   * @param {ActorEd} actor The actor performing the recovery
   * @param {RecoveryWorkflowOptions&Partial<RollableWorkflowOptions>} [options] Options for the recovery workflow
   */
  constructor( actor, options = {} ) {
    super( actor, options );

    this._recoveryMode = options.recoveryMode || "recovery";
    this._actorCharacteristics = actor.system.characteristics;
    this._rollToMessage = options.rollToMessage ?? true;

    this._steps = [
      this._validateRecovery.bind( this ),
    ];

    this._initRollableSteps();
  }

  // region Workflow Steps

  /**
   * Validates that recovery is needed and possible based on the recovery mode
   * @private
   */
  async _validateRecovery() {
    if ( !( this._recoveryMode in WORKFLOWS.recoveryModes ) ) {
      throw new WorkflowInterruptError(
        this,
        _loc( "ED.Notifications.Warn.invalidRecoveryMode" ),
      );
    }

    if (
      ( this._isRecovery || this._isStunRecovery )
      && !this._actor.hasDamage( "standard" )
    ) {
      ui.notifications.info( _loc( "ED.Notifications.Info.noDamageNoRecoveryNeeded" ) );
      this.cancel();
      return;

    }

    if (
      this._isStunRecovery
      && !this._actor.hasDamage( "stun" )
    ) {
      ui.notifications.info( _loc( "ED.Notifications.Info.noDamageNoRecoveryNeeded" ) );
      this.cancel();
      return;
    }

    if (
      this._needsNoRoll()
      && !this._actor.hasWounds( "standard" )
    ) {
      ui.notifications.info( _loc( "ED.Notifications.Info.noFullRestRecoveryNeeded" ) );
      this.cancel();
      return;
    }

    if (
      !this._isFullRest
      && this._actorCharacteristics.recoveryTestsResource.value < 1
    ) {
      ui.notifications.warn( _loc( "ED.Notifications.Warn.noRecoveryTestsAvailable" ) );
      this.cancel();
    }
  }

  /** @inheritDoc */
  async _prepareRollOptions() {
    this._rollOptions = RecoveryRollOptions.fromActor(
      {
        recoveryMode:  this._recoveryMode,
        initialDamage: {
          standard: this._actorCharacteristics.health.damage.standard,
          stun:     this._actorCharacteristics.health.damage.stun,
        },
        initialWounds: this._actorCharacteristics.health.wounds,
        ignoreWounds:  false,
        actor:         this._actor,
        _dummy:         this._needsNoRoll(),
      },
      this._actor,
    );
  }

  /** @inheritDoc */
  async _createRoll() {
    return super._createRoll();
  }

  /** @inheritdoc */
  async _processRoll() {
    if ( this._needsRoll() ) return super._processRoll();

    if ( !this._isFullRest ) return;

    let wounds = this._actorCharacteristics.health.wounds;
    let availableRecoveryTests = this._actorCharacteristics.recoveryTestsResource.max;
    const stunRecoveryAvailable = true;

    if ( this._canHealWound( availableRecoveryTests ) ) {
      wounds = Math.max( wounds - 1, 0 );
      availableRecoveryTests -= 1;
    }

    await this._actor.update( {
      "system.characteristics": {
        "recoveryTestsResource": {
          "value":                 availableRecoveryTests,
          "stunRecoveryAvailable": stunRecoveryAvailable,
        },
        "health":                {
          "wounds": wounds,
        },
      },
    } );

    return super._processRoll();

  }

  // endregion

}
