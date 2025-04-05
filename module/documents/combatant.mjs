import InitiativeRollOptions from "../data/roll/initiative.mjs";
import EdRoll from "../dice/ed-roll.mjs";

export default class CombatantEd extends foundry.documents.Combatant {

  /** @inheritdoc */
  getInitiativeRoll( _ ) {
    // do stuff, how best to ask for initiative talents?
    if ( !this.actor ) throw new Error( "Can't roll initiative: combatant has no actor" );

    const data = {
      testType:   "effect",
      rollType:   "initiative",
      chatFlavor: game.i18n.format( "ED.Chat.Flavor.rollInitiative", { sourceActor: this.actor.name } ),
      step:       {
        base:     this.actor.system.initiative,
        modifier: {},
      },
      target: null,
      strain: {
        // TODO: fill from used abilities,
        base:      0,
        modifiers: {},
      },
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