import StartRoundCombatantPrompt from "../applications/combat/start-round-combatant-prompt.mjs";

export default class CombatEd extends foundry.documents.Combat {

  /** @inheritdoc */
  _sortCombatants( a, b ) {
    // player characters always go first on a tie with NPCs
    const initiativeA = Number.isNumeric( a.initiative ) ? a.initiative : -Infinity;
    const initiativeB = Number.isNumeric( b.initiative ) ? b.initiative : -Infinity;
    return ( initiativeB - initiativeA ) || ( a.isPC ? -1 : 1 );
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
    await super._onStartRound( context );
    await this.#executeEffectsForAll( "roundStart" );

    await this.resetInitiatives();
    await this.#promptAllInitiatives();
    await this.rollAll();
    await this.update( { turn: 0 } );
  }

  /** @inheritdoc */
  async _onEndRound( context ) {
    await super._onEndRound( context );
    await this.#executeEffectsForAll( "roundEnd" );
  }

  /** @inheritdoc */
  async _onStartTurn( combatant, context ) {
    super._onStartTurn( combatant, context );
    await this.#executeEffectsForAll( "turnStart" );
    if ( combatant.actor.statuses.has( "attuningOnTheFly" ) ) await combatant.actor.reattuneSpells();
  }

  /** @inheritdoc */
  async _onEndTurn( combatant, context ) {
    // add expire measured templates
    super._onEndTurn( combatant, context );
    await this.#executeEffectsForAll( "turnEnd" );
  }

  // endregion

  /**
   * Reset the initiative of all combatants in this combat.
   * @param {object} options          Options for the reset.
   * @param {boolean} options.force   Force the reset even if the Combatant#system.keepInitiative is `true`.
   * @returns {Promise<void>}
   */
  async resetInitiatives( options = { force: false } ) {
    for ( const combatant of this.combatants ) {
      if ( options.force || !combatant.system.keepInitiative ) {
        await combatant.resetInitiative();
      }
    }
  }

  /**
   * Execute ActiveEffects that are triggered by the given execution time.
   * @param {keyof eaeExecutionTime} executionTime The instant in the combat when the effect should be executed.
   * @param {CombatantEd} combatant                The combatant to execute the effects for.
   * @returns {Promise<void>}
   */
  async #executeEffects( executionTime, combatant ) {
    if ( !combatant ) return;
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

  /**
   * Prompt all combatants to roll initiative.
   * @returns {Promise<Awaited<unknown>[]>} The results of the prompts.
   */
  async #promptAllInitiatives() {
    return Promise.all( this.combatants.map( combatant => {
      if ( combatant.system.savePromptSettings ) return undefined;
      const decidingUser = game.users.getDesignatedUser( user =>
        combatant.isUsersPC( user )
      );
      if ( !decidingUser || !decidingUser.active ) return StartRoundCombatantPrompt.waitPrompt( {}, combatant );
      else return decidingUser.query(
        "ed4e.startCombatRoundPrompt",
        { combatantUuid: combatant.uuid }
      );
    } ) );
  }

}