import ApplicationEd from "../api/application.mjs";


export default class StartRoundCombatantPrompt extends ApplicationEd {

  /**
   * @inheritDoc
   * @param {Partial<Configuration>} [options] The options to pass to the constructor. See {@link ApplicationV2} for details.
   * @param {CombatantEd} combatant The combatant to show the prompt for.
   */
  constructor( options = {}, combatant ) {
    if ( !combatant ) throw new TypeError( "ED4E | Cannot construct StartRoundCombatantPrompt without a combatant." );

    super( options );
    this.resolve = options.resolve;
    this.combatant = combatant;
    this.initialCombatantSystemData = combatant.clone().system;
    this.initialStatuses = [ ...combatant.actor.statuses ];
  }

  /**
   * Wait for dialog to be resolved.
   * @param {object} [options]      Options to pass to the constructor.
   * @param {CombatantEd} combatant The combatant to show the prompt for.
   * @returns {any}                 The evaluated value.
   */
  static waitPrompt( options = {}, combatant ) {
    return new Promise( ( resolve ) => {
      options.resolve = resolve;
      new this( options, combatant ).render( { force: true, focus: true } );
    } );
  }

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    id:       "start-round-combatant-prompt-{id}",
    uniqueId: String( ++foundry.applications.api.ApplicationV2._appId ),
    classes:  [ "start-round-combatant-prompt", ],
    window:   {
      positioned:     true,
      icon:           "",
      minimizable:    false,
      resizable:      true,
    },
    actions: {
      rollInitiative:     StartRoundCombatantPrompt._continue,
      toggleCombatOption: StartRoundCombatantPrompt._toggleCombatOptionCheckbox,
    },
    form:    {
      handler:        StartRoundCombatantPrompt.#onFormSubmission,
      submitOnChange: true,
    },
    position: {
      width:  "auto",
      height: "auto"
    }
  };

  /** @inheritdoc */
  static PARTS = {
    main: {
      template: "systems/ed4e/templates/combat/start-round-combatant-prompt.hbs",
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
      classes:  [ "flexrow" ],
    },
  };

  // region Properties

  /**
   * Title of the application window, dynamically created based on the combatant's name.
   * @returns {string} The combatant to show the prompt for.
   */
  get title() {
    return game.i18n.format( "ED.Dialogs.Title.startRoundCombatantPrompt", {
      name: this.combatant.name
    } );
  }

  // endregion

  // region Form Handling

  static async #onFormSubmission( event, form, formData ) {
    const data = foundry.utils.expandObject( formData.object );

    // update combatant initiative abilities and show prompt option
    return this.combatant.update( data );
  }

  // endregion

  // region Rendering

  /** @inheritdoc */
  async _prepareContext( options = {} ) {
    const context = await super._prepareContext( options );

    context.combatantSystemFields = this.combatant.system.schema.fields;

    return context;
  }

  /** @inheritdoc */
  async _preparePartContext( partId, context, options ) {
    const partContext = await super._preparePartContext( partId, context, options );

    switch ( partId ) {
      case "main": {
        partContext.combatant = this.combatant;
        partContext.combatOptions = CONFIG.ED4E.statusEffects.filter( status => status.combatOption );
        partContext.combatOptions.forEach( status => {
          status.active = this.combatant.actor.statuses.has( status.id );
        } );

        const { adders, substitutes } = this.combatant.actor.getModifierAbilities( "initiative" );
        partContext.initiativeIncreaseAbilities = adders;
        partContext.initiativeReplacementEffects = substitutes;
        break;
      }
      case "footer": {
        partContext.buttons = [
          {
            action:  "rollInitiative",
            classes: "roll flex-row",
            default: true,
            icon:    `fa-solid ${ CONFIG.ED4E.icons.dice }`,
            label:   "ED.Dialogs.Buttons.roundStartRollInitiative"
          }
        ];
        break;
      }
      default:
        break;
    }

    return partContext;
  }

  // endregion

  // region Event Handlers

  async close( options = {} ) {
    if ( options?.continue ) return super.close( options );

    await this.combatant.update( { system: this.initialCombatantSystemData.toObject() } );
    for ( const status of CONFIG.ED4E.statusEffects.filter( status => status.combatOption ) ) {
      await this.combatant.actor.toggleStatusEffect( status.id, { active: this.initialStatuses.includes( status.id ) } );
    }

    this.resolve?.( null );
    return super.close( options );
  }

  /**
   * closes the prompt and resolves the promise with a value of true.
   * @param {PointerEvent} event The pointer event.
   * @param {*} _  Unused parameter, included for consistency with the method signature.
   */
  static async _continue( event, _ ) {
    event.preventDefault();

    this.resolve?.( true );
    this.close( { continue: true, } );
  }

  static async _toggleCombatOptionCheckbox( event, target ) {
    // this feels really hacky and probably could be done nicely?

    const combatOption = target.dataset.combatOption;
    if ( !combatOption ) return;

    const active = this.combatant.actor.statuses.has( combatOption );
    await this.combatant.actor.toggleStatusEffect( combatOption, { active: !active } );

    target.dataset.activated = !active;

    this.render();
  }

  // endregion
}