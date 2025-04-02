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
    await this.#executeEffectsForAll( "combatStart" );
    return super.startCombat();
  }

  /** @inheritdoc */
  async endCombat() {
    await this.#executeEffectsForAll( "combatEnd" );
    return super.endCombat();
  }

  /** @inheritdoc */
  async _onStartRound( context ) {
    // ask for changing stances
    await this.#executeEffectsForAll( "roundStart" );
    return super._onStartRound( context );
  }

  /** @inheritdoc */
  async _onEndRound( context ) {
    await this.#executeEffectsForAll( "roundEnd" );
    return super._onEndRound( context );
  }

  /** @inheritdoc */
  async _onStartTurn( combatant, context ) {
    await this.#executeEffectsForAll( "turnStart" );
    return super._onStartTurn( combatant, context );
  }

  /** @inheritdoc */
  async _onEndTurn( combatant, context ) {
    // add expire measured templates
    await this.#executeEffectsForAll( "turnEnd" );
    return super._onEndTurn( combatant, context );
  }

  // endregion

  /**
   * Execute ActiveEffects that are triggered by the given execution time.
   * @param {keyof eaeExecutionTime} executionTime The instant in the combat when the effect should be executed.
   * @param {CombatantEd} combatant                The combatant to execute the effects for.
   * @returns {Promise<void>}
   */
  async #executeEffects( executionTime, combatant ) {
    const effects = combatant.effects.filter( effect => effect.system?.executeOn === executionTime );

    for ( const effect of effects ) {
      if ( !effect.disabled ) await effect.system.execute();
    }
  }

  async #executeEffectsForAll( executionTime ) {
    const combatants = new Set( this.combatants.map( c => c.actor ) );

    for ( const combatant of combatants ) {
      await this.#executeEffects( executionTime, combatant );
    }
  }

}