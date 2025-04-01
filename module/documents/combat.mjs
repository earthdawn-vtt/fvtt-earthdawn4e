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
  async startCombat() {
    // maybe execute effects?
    return super.startCombat();
  }

  /** @inheritdoc */
  async endCombat() {
    // maybe execute effects?
    return super.endCombat();
  }

  /** @inheritdoc */
  async _onStartRound( context ) {
    // ask for changing stances
    // maybe execute effects?
    return super._onStartRound( context );
  }

  /** @inheritdoc */
  async _onEndRound( context ) {
    // maybe execute effects?
    return super._onEndRound( context );
  }

  /** @inheritdoc */
  async _onStartTurn( combatant, context ) {
    return super._onStartTurn( combatant, context );
  }

  /** @inheritdoc */
  async _onEndTurn( combatant, context ) {
    // add expire measured templates
    return super._onEndTurn( combatant, context );
  }

  // endregion

}