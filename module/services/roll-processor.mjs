// module/services/roll-processor.mjs
export default class RollProcessor {
  /**
   * Process a roll and apply its effects to an actor
   * @param {EdRoll} roll - The roll to process
   * @param {ActorEd} actor - The actor to apply effects to
   * @returns {EdRoll} The processed roll
   */
  static async process( roll, actor ) {
    if ( !roll ) return null;

    // Process strain
    if ( roll.totalStrain ) {
      actor.takeDamage( roll.totalStrain, {
        isStrain:    true,
        damageType:  "standard",
        ignoreArmor: true,
      } );
    }

    // Process resources
    const { karma, devotion } = roll.options;
    const resourcesUsed = this._processResources( actor, karma, devotion );

    if ( !resourcesUsed ) {
      ui.notifications.warn( game.i18n.localize( "ED.Warnings.NotEnoughResources" ) );
    }

    // Process by roll type
    const typeProcessor = this._getTypeProcessor( roll.options.rollType );
    if ( typeProcessor ) {
      return await typeProcessor( roll, actor );
    }

    // Default processing
    await roll.toMessage();
    return roll;
  }

  static _processResources( actor, karma, devotion ) {
    const karmaOk = actor.system.karma.value >= karma.pointsUsed;
    const devotionOk = actor.system.devotion.value >= devotion.pointsUsed;

    if ( karma.pointsUsed ) actor.update( {"system.karma.value": actor.system.karma.value - karma.pointsUsed} );
    if ( devotion.pointsUsed ) actor.update( {"system.devotion.value": actor.system.devotion.value - devotion.pointsUsed} );

    return karmaOk && devotionOk;
  }

  static _getTypeProcessor( rollType ) {
    const processors = {
      "jumpUp":    RollProcessor._processJumpUp,
      "knockdown": RollProcessor._processKnockdown,
      // Add other specialized processors here
    };
    return processors[rollType];
  }

  static async _processJumpUp( roll, actor ) {
    await roll.evaluate();
    if ( roll._total && roll.isSuccess ) {
      actor.update( {"system.condition.knockedDown": false} );
    }
    return roll.toMessage();
  }

  static async _processKnockdown( roll, actor ) {
    await roll.evaluate();
    if ( roll._total && !roll.isSuccess ) {
      actor.update( {"system.condition.knockedDown": true} );
    }
    return roll.toMessage();
  }
}