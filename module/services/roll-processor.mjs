/**
 * @import { RollResourceData } from "../_types.mjs";
 */

/**
 * Service class for processing rolls and applying their effects to actors.
 */
export default class RollProcessor {

  /**
   * @callback RollProcessorCallback
   * @param {EdRoll} roll - The roll to process
   * @param {ActorEd} actor - The actor to apply effects to
   * @param {object} [updateData={}] - The data used to update the actor upstream
   * @returns {Promise<object>} - The update data to apply to the actor
   */

  /**
   * Processors for specific roll types
   * Each processor should handle the roll and return the necessary updates to the actor
   * @type {Record<string, RollProcessorCallback>}
   */
  static _processors = {
    "initiative": ( roll, actor, updateData = {} ) => {
      return updateData;
    },
    "jumpUp":    RollProcessor._processJumpUp,
    "knockdown": RollProcessor._processKnockdown,
    "recovery":  RollProcessor._processRecovery
    // Add other specialized processors here
  };

  /**
   * @typedef {object} ProcessOptions
   * @property {boolean} [skipResources=false] Whether to skip resource processing
   * @property {boolean} [skipStrain=false] Whether to skip strain processing
   * @property {boolean} [rollToMessage=true] Whether to send the roll to chat
   */

  /**
   * Process a roll and apply its effects to an actor
   * @param {EdRoll} roll - The roll to process
   * @param {ActorEd} actor - The actor to apply effects to
   * @param {ProcessOptions} options - Options for processing the roll
   * @returns {EdRoll} The processed roll
   */
  static async process(
    roll,
    actor,
    options = {
      skipResources: false,
      skipStrain:    false,
      rollToMessage: true
    }
  ) {
    if ( !roll ) throw new Error( "RollProcessor.process: No roll provided" );

    if ( !roll._evaluated ) await roll.evaluate();

    if ( roll.isDummy ) return roll;

    // Initialize update object to collect all changes
    const updateData = {
      system: {}
    };

    // Process strain
    if ( !options.skipStrain && roll.totalStrain ) {
      await actor.takeDamage( roll.totalStrain, {
        isStrain:    true,
        damageType:  "standard",
        ignoreArmor: true
      } );
    }

    // Process resources
    if ( !options.skipResources ) {
      const { karma, devotion } = roll.options;
      this._processResources( actor, karma, devotion, updateData );
    }

    // Process by roll type
    const typeProcessor = this._processors[roll.options.rollType];
    if ( typeProcessor ) {
      await typeProcessor( roll, actor, updateData );
    }

    // Apply all collected updates in a single operation if there are any
    if ( Object.keys( updateData ).length > 0 ) {
      await actor.update( updateData );
    }

    // Default processing if no type processor was called
    if ( options.rollToMessage ) {
      await roll.toMessage();
    }

    return roll;
  }

  /**
   * Process karma and devotion usage for a roll.
   * @param {ActorEd} actor       The actor who made the roll.
   * @param {RollResourceData} karma        The karma usage data.
   * @param {RollResourceData} devotion     The devotion usage data.
   * @param {object} [updateData] The update data to collect changes in.
   * @param {object} [updateData.system] The updates for the character's system data.
   * @returns {object}            The modified update data.
   * @protected
   */
  static _processResources( actor, karma, devotion, updateData = { system: {}, } ) {
    const karmaOk = actor.system.karma.value >= karma.pointsUsed;
    const devotionOk = actor.system.devotion.value >= devotion.pointsUsed;

    if ( karma.pointsUsed && karmaOk ) {
      updateData.system.karma ??= {};
      updateData.system.karma.value = actor.system.karma.value - karma.pointsUsed;
    }

    if ( devotion.pointsUsed && devotionOk ) {
      updateData.system.devotion ??= {};
      updateData.system.devotion.value = actor.system.devotion.value - devotion.pointsUsed;
    }

    if ( !karmaOk )
      ui.notifications.warn( _loc( "ED.Notifications.Warn.notEnoughKarmaUsedAll" ) );
    if ( !devotionOk )
      ui.notifications.warn( _loc( "ED.Notifications.Warn.notEnoughDevotionUsedAll" ) );

    return updateData;
  }

  /**
   * Process a jump up roll.
   * @param {EdRoll} roll         The jump up roll.
   * @param {ActorEd} actor       The actor who made the roll.
   * @param {object} [updateData] The update data.
   * @param {object} [updateData.system] The updates for the character's system data.
   * @returns {Promise<object>}   The modified update data.
   * @protected
   */
  static async _processJumpUp( roll, actor, updateData = { system: {} } ) {
    if ( roll.isSuccess ) {
      await actor.toggleStatusEffect( "knockedDown", { active: false } );
    }
    return updateData;
  }

  /**
   * Process a knockdown roll.
   * @param {EdRoll} roll         The knockdown roll.
   * @param {ActorEd} actor       The actor who made the roll.
   * @param {object} [updateData] The update data.
   * @param {object} [updateData.system] The updates for the character's system data.
   * @returns {Promise<object>}   The modified update data.
   * @protected
   */
  static async _processKnockdown( roll, actor, updateData = { system: {} } ) {
    if ( !roll.isSuccess ) {
      await actor.toggleStatusEffect( "knockedDown", { active: true } );
    }
    return updateData;
  }

  /**
   * Process a recovery roll.
   * @param {EdRoll} roll         The recovery roll.
   * @param {ActorEd} actor       The actor who made the roll.
   * @param {object} [updateData] The update data.
   * @param {object} [updateData.system] The updates for the character's system data.
   * @returns {Promise<object>}   The modified update data.
   * @protected
   */
  static async _processRecovery( roll, actor, updateData = { system: {} } ) {
    let availableRecoveryTests = actor.system.characteristics.recoveryTestsResource.value;
    let stunRecoveryAvailable = actor.system.characteristics.recoveryTestsResource.stunRecoveryAvailable;
    let damageStandard = actor.system.characteristics.health.damage.standard;
    let damageStun = actor.system.characteristics.health.damage.stun;
    let wounds = actor.system.characteristics.health.wounds;
    let healing = 0;

    const isFullRest = roll.options.recoveryMode === "fullRest";
    const isRecovery = roll.options.recoveryMode === "recovery";
    const isStunRecovery = roll.options.recoveryMode === "recoverStun";
    const canHealWound = !actor.hasDamage( "standard" )
      && actor.hasWounds( "standard" )
      && availableRecoveryTests > 0;

    if ( isFullRest ) {
      stunRecoveryAvailable = true;
      availableRecoveryTests = actor.system.characteristics.recoveryTestsResource.max;
      if ( canHealWound ) {
        wounds = Math.max( wounds - 1, 0 );
        availableRecoveryTests -= 1;
      }
    }

    healing = actor.getAmountHealing( roll.total, roll.options.ignoreWounds );

    if ( isStunRecovery ) {
      stunRecoveryAvailable = false;
      damageStun = Math.max( damageStun - healing, 0 );
      availableRecoveryTests -= 1;
    }

    if ( isRecovery || ( isFullRest && actor.hasDamage( "standard" ) ) ) {
      const healingLeft = Math.max( healing - damageStandard, 0 );
      damageStandard = Math.max( damageStandard - healing, 0 );
      damageStun = Math.max( damageStun - healingLeft, 0 );
      availableRecoveryTests -= 1;
    }

    updateData.system.characteristics ??= {};
    updateData.system.characteristics.recoveryTestsResource = {
      value:                 availableRecoveryTests,
      stunRecoveryAvailable: stunRecoveryAvailable
    };
    updateData.system.characteristics.health = {
      damage: {
        standard: damageStandard,
        stun:     damageStun
      },
      wounds: wounds
    };

    return updateData;
  }
}