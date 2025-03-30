export default class CombatantEd extends foundry.documents.Combatant {


  // TODO: add initiative formula for combatant
  // see foundry.documents.Combatant line 182
  /** @inheritdoc */
  getInitiativeRoll( formula ) {
    // do stuff, how best to ask for initiative talents?
    return super.getInitiativeRoll( formula );
  }

}