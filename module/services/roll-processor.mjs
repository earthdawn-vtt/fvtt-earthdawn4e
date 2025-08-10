// module/services/roll-processor.mjs
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
   * Each processor should handle the roll and return necessary updates to the actor
   * @type {Record<string, RollProcessorCallback>}
   */
  static _processors = {
    "initiative": ( roll, actor, updateData = {} ) => { return updateData; },
    "jumpUp":     RollProcessor._processJumpUp,
    "knockdown":  RollProcessor._processKnockdown,
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

    // Initialize update object to collect all changes
    const updateData = {};

    // Process strain
    if ( !options.skipStrain && roll.totalStrain ) {
      await actor.takeDamage( roll.totalStrain, {
        isStrain:    true,
        damageType:  "standard",
        ignoreArmor: true,
      } );
    }

    // Process resources
    if ( !options.skipResources ) {
      const { karma, devotion } = roll.options;
      this._processResources( actor, karma, devotion, updateData );
    }

    // Process by roll type
    const typeProcessor = this._processors[ roll.options.rollType ];
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

  static _processResources( actor, karma, devotion, updateData = {} ) {
    const karmaOk = actor.system.karma.value >= karma.pointsUsed;
    const devotionOk = actor.system.devotion.value >= devotion.pointsUsed;

    if ( karma.pointsUsed && karmaOk ) {
      updateData["system.karma.value"] = actor.system.karma.value - karma.pointsUsed;
    }

    if ( devotion.pointsUsed && devotionOk ) {
      updateData["system.devotion.value"] = actor.system.devotion.value - devotion.pointsUsed;
    }

    if ( !karmaOk )
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.notEnoughKarmaUsedAll" ) );
    if ( !devotionOk )
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.notEnoughDevotionUsedAll" ) );

    return updateData;
  }

  static async _processJumpUp( roll, actor, updateData = {} ) {
    await roll.evaluate();
    if ( roll.isSuccess ) {
      updateData["system.condition.knockedDown"] = false;
      // actor.toggleStatusEffect( "knockedDown", { active: false,}, );
    }
    return updateData;
  }

  static async _processKnockdown( roll, actor, updateData = {} ) {
    await roll.evaluate();
    if ( roll.isFailure ) {
      updateData["system.condition.knockedDown"] = true;
      // actor.toggleStatusEffect( "knockedDown", { active: true, overlay: true, }, );
    }
    return updateData;
  }
}