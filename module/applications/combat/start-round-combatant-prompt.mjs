const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * @augments ApplicationV2
 * @mixes HandlebarsApplicationMixin
 */
export default class StartRoundCombatantPrompt extends HandlebarsApplicationMixin( ApplicationV2 ) {

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
    classes:  [ "earthdawn4e", "start-round-combatant-prompt" ],
    tag:      "form",
    window:   {
      frame:          true,
      positioned:     true,
      title:          "",
      icon:           "",
      minimizable:    false,
      resizable:      true,
    },
    actions: {},
    form:    {
      handler:        StartRoundCombatantPrompt._onFormSubmission,
      submitOnChange: false,
      closeOnSubmit:  true,
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
    },
  };

  // region Form Handling

  static async _onFormSubmission( event, form, formData ) {
    // do stuff
    console.debug( "ED4E | StartRoundCombatantPrompt._onFormSubmission", event, form, formData );
  }

  // endregion

  // region Rendering

  /** @inheritdoc */
  async _prepareContext( options = {} ) {
    return super._prepareContext( options );
  }

  /** @inheritdoc */
  async _preparePartContext( partId, context, options ) {
    const partContext = await super._preparePartContext( partId, context, options );

    switch ( partId ) {
      case "main":
        partContext.combatant = this.combatant;
        partContext.combatOptions = CONFIG.ED4E.statusEffects.filter( status => status.combatOption );
        break;
      case "footer":
        partContext.buttons = [
          {
            action:   "submit",
            classes:  "roll",
            default:  true,
            icon:     `fa-solid ${CONFIG.ED4E.icons.dice}`,
            label:    "ED.Dialogs.Buttons.roll",
          },
        ];
        break;
      default:
        break;
    }

    return partContext;
  }

  // endregion
}