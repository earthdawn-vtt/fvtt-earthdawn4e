import InitiativeRollOptions from "../data/roll/initiative.mjs";
import EdRoll from "../dice/ed-roll.mjs";

export default class CombatantEd extends foundry.documents.Combatant {

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