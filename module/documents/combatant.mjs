import InitiativeRollOptions from "../data/roll/initiative.mjs";
import EdRoll from "../dice/ed-roll.mjs";
import StartRoundCombatantPrompt from "../applications/combat/start-round-combatant-prompt.mjs";

export default class CombatantEd extends foundry.documents.Combatant {

  // region Static Properties

  static startRoundQuery = async ( { combatantUuid, options = {} } ) => {
    const combatant = await fromUuid( combatantUuid );
    return StartRoundCombatantPrompt.waitPrompt( options, combatant );
  };

  // endregion

  // region Properties

  /**
   * Check if the combatant is a player character. Defined as: the actor of this
   * combatant is an assigned character of any user or the combatant is not an NPC.
   * @type {boolean}
   */
  get isPC() {
    return game.users.assignedCharacters.includes( this.actor )
      || !this.isNPC;
  }

  // endregion

  /**
   * Check if the combatant is a player character of the given user.
   * @param {foundry.documents.User} user The user to check.
   * @returns {boolean} `True` if the combatant is a player character of the user. This means, the actor of this combatant
   * is the assigned character of the user. Or: the user is not a GM, this combatant is not an NPC, and the user is the
   * owner of the combatant.
   */
  isUsersPC( user ) {
    return ( user.character === this.actor )
      || ( !user.isGM
        && !this.isNPC // means has actor and player owner
        && this.testUserPermission( user, "OWNER" ) );
  }

  /** @inheritdoc */
  getInitiativeRoll( _ ) {
    // do stuff, how best to ask for initiative talents?
    if ( !this.actor ) throw new Error( "Can't roll initiative: combatant has no actor" );

    const initiativeReplacement = fromUuidSync( this.system.replacementEffect );
    const initiativeIncreaseAbilities = this.system.increaseAbilities.map( fromUuidSync );

    const initiativeStep = initiativeReplacement?.system?.rankFinal ?? this.actor.system.initiative;
    const stepModifiers = {};
    const strainModifiers = {};
    for ( const ability of initiativeIncreaseAbilities ) {
      const itemStep = ability.system.rankFinal ?? 0;
      const strain = ability.system.strain ?? 0;
      const itemName = ability.name;
      if ( !stepModifiers[itemName] ) stepModifiers[itemName] = 0;
      stepModifiers[itemName] += itemStep;
      if ( !strainModifiers[itemName] ) strainModifiers[itemName] = 0;
      strainModifiers[itemName] += strain;
    }

    const data = {
      testType:   "effect",
      rollType:   "initiative",
      chatFlavor: game.i18n.format( "ED.Chat.Flavor.rollInitiative", { sourceActor: this.actor.name } ),
      step:       {
        base:      initiativeStep,
        modifiers: stepModifiers,
      },
      target: null,
      strain: {
        base:      0,
        modifiers: strainModifiers,
      },
      replacementEffect: initiativeReplacement?.uuid,
      increaseAbilities: initiativeIncreaseAbilities.map( i => i.uuid ),
    };

    const rollOptions = InitiativeRollOptions.fromActor( data, this.actor, {} );
    return new EdRoll( "", this.actor.getRollData(), rollOptions );
  }

  /**
   * Reset the initiative of this combatant.
   * @returns {Promise<undefined|CombatantEd>} The updated combatant.
   */
  async resetInitiative() {
    if ( this.initiative === null ) return;
    return this.update( { initiative: null } );
  }

}