export default class CombatEd extends foundry.documents.Combat {

  /** @inheritdoc */
  _sortCombatants( a, b ) {
    // add that player characters always go first on a tie with NPCs
    return super._sortCombatants( a, b );
  }

  // region Lifecycle Events

  /** @inheritdoc */
  _onDelete( options, userId ) {
    super._onDelete( options, userId );
    /* if ( game.user.id === userId ) {
      this.expireCombatEffects();
      this.expireMeasuredTemplates( "combat" );
    } */
  }

  /** @inheritdoc */
  _onStartRound( context ) {
    // ask for changing stances
    // maybe execute effects?
  }

  /** @inheritdoc */
  async _onEndTurn( combatant, context ) {
    // add expire measured templates
    return super._onEndTurn( combatant, context );
  }

  // endregion

}