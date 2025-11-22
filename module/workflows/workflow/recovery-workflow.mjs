import ActorWorkflow from "./actor-workflow.mjs";
import RecoveryRollOptions from "../../data/roll/recovery.mjs";
import ED4E from "../../config/_module.mjs";
import WorkflowInterruptError from "../workflow-interrupt.mjs";
import Rollable from "./rollable.mjs";


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

  _canHealWound( availableRecoveryTests ) {
    return !this._actor.hasDamage( "standard" )
      && this._actor.hasWounds( "standard" )
      && availableRecoveryTests > 0;
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
   * @returns {Promise<void>}
   * @private
   */
  async _validateRecovery() {
    if ( !( this._recoveryMode in ED4E.WORKFLOWS.recoveryModes ) ) {
      throw new WorkflowInterruptError(
        this,
        game.i18n.localize( "ED.Notifications.Warn.invalidRecoveryMode" ),
      );
    }

    if (
      ( this._isRecovery || this._isStunRecovery )
      && !this._actor.hasDamage( "standard" )
    ) {
      ui.notifications.info( game.i18n.localize( "ED.Notifications.Info.noDamageNoRecoveryNeeded" ) );
      this.cancel();
      return;

    }

    if (
      this._isStunRecovery
      && !this._actor.hasDamage( "stun" )
    ) {
      ui.notifications.info( game.i18n.localize( "ED.Notifications.Info.noDamageNoRecoveryNeeded" ) );
      this.cancel();
      return;
    }

    if (
      this._isFullRest
      && !this._actor.hasDamage( "standard" )
      && !this._actor.hasWounds( "standard" )
    ) {
      ui.notifications.info( game.i18n.localize( "ED.Notifications.Info.noFullRestRecoveryNeeded" ) );
      this.cancel();
      return;
    }

    if (
      !this._isFullRest
      && this._actorCharacteristics.recoveryTestsResource.value < 1
    ) {
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.noRecoveryTestsAvailable" ) );
      this.cancel();
    }
  }

  /** @inheritDoc */
  async _prepareRollOptions() {
    if ( this._isFullRest && !this._actor.hasDamage( "standard" ) ) {
      this._rollOptions = null;
      this._roll = null;
      return;
    }

    this._rollOptions = RecoveryRollOptions.fromActor(
      {
        recoveryMode:  this._recoveryMode,
        initialDamage: {
          standard: this._actorCharacteristics.health.damage.standard,
          stun:     this._actorCharacteristics.health.damage.stun,
        },
        initialWounds: this._actorCharacteristics.health.wounds,
        ignoreWounds:  false, // TODO: Implement ignore wounds option
        actor:         this._actor,
      },
      this._actor,
    );
  }

  /** @inheritDoc */
  async _createRoll() {
    if ( this._rollOptions === null ) return;

    return super._createRoll();
  }

  /**
   * Processes the recovery based on the roll result and recovery mode
   * @returns {Promise<void>}
   * @private
   */
  async _processRoll() {
    if ( this._roll ) return super._processRoll();

    let availableRecoveryTests = this._actorCharacteristics.recoveryTestsResource.value;
    let stunRecoveryAvailable = this._actorCharacteristics.recoveryTestsResource.stunRecoveryAvailable;
    let wounds = this._actorCharacteristics.health.wounds;

    if ( this._isFullRest ) {
      stunRecoveryAvailable = true;
      availableRecoveryTests = this._actorCharacteristics.recoveryTestsResource.max;
      if ( this._canHealWound( availableRecoveryTests ) ) {
        wounds = Math.max( wounds - 1, 0 );
        availableRecoveryTests -= 1;
      }
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

  }

  // endregion

}
