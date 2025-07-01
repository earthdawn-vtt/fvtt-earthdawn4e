import EdRoll from "../../dice/ed-roll.mjs";
import EdRollOptions from "../../data/roll/common.mjs";
import ED4E from "../../config/_module.mjs";
import ApplicationEd from "../api/application.mjs";

export default class RollPrompt extends ApplicationEd {

  /** @inheritDoc */
  constructor(
    edRollOptions = {},
    { resolve, rollData = {}, options = {} } = {},
  ) {
    if ( !( edRollOptions instanceof EdRollOptions ) ) {
      throw new TypeError(
        "ED4E | Cannot construct RollPrompt from data. Must be of type `RollOptions`.",
      );
    }
    super( options );

    this.resolve = resolve;
    this.edRollOptions = edRollOptions;
    this.rollData = rollData;

    const manualModifierKey = `step.modifiers.${ game.i18n.localize( "ED.Rolls.Modifiers.manual" ) }`;
    this.edRollOptions.updateSource( {
      [ manualModifierKey ]: edRollOptions.step.modifiers.manual ?? 0,
    } );
  }

  /**
   * Wait for dialog to be resolved.
   * @param {object} edRollOptions             The roll options that are updated by the prompt.
   * @param {object} [options]        Options to pass to the constructor.
   * @returns {Promise<EdRoll|null>}  Created roll instance or `null`.
   */
  static waitPrompt( edRollOptions, options = {} ) {
    return new Promise( ( resolve ) => {
      options.resolve = resolve;
      new this( edRollOptions, options ).render( true, { focus: true } );
    } );
  }

  /**
   * @description                 Roll a step prompt.
   */
  static rollArbitraryPrompt() {
    RollPrompt.waitPrompt(
      new EdRollOptions( {
        testType:   "arbitrary",
        chatFlavor: game.i18n.localize( "ED.Chat.Header.arbitraryTest" ),
      } ),
    ).then( ( roll ) => roll?.toMessage() );
  }

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    id:       "roll-prompt-{id}",
    uniqueId: String( ++foundry.applications.api.ApplicationV2._appId ),
    classes:  [ "earthdawn4e", "roll-prompt" ],
    tag:      "form",
    position: {
      width:  "auto",
      height: "auto",
    },
    window: {
      frame: true,
      title: "ED.Dialogs.Title.rollPrompt",
    },
    actions: {
      roll:            this._roll,
    },
    form: {
      handler:        RollPrompt.#onFormSubmission,
      submitOnChange: true,
      closeOnSubmit:  false,
    },
  };

  /** @inheritDoc */
  static PARTS = {
    base: {
      template: "systems/ed4e/templates/prompts/roll-prompt.hbs",
      id:       "-base-input",
      classes:  [ "base-input" ],
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
      id:       "-footer",
      classes:  [ "flexrow" ],
    },
  };

  /** @inheritDoc */
  buttons = [
    {
      type:     "button",
      label:    game.i18n.localize( "ED.Dialogs.Buttons.cancel" ),
      cssClass: "cancel",
      icon:     `fas ${ED4E.icons.cancel}`,
      action:   "close",
    },
    {
      type:     "button",
      label:    game.i18n.localize( "ED.Dialogs.Buttons.roll" ),
      cssClass: "roll",
      icon:     `fa-regular ${ED4E.icons.dice}`,
      action:   "roll",
    },
  ];

  /** @inheritDoc */
  async _prepareContext( options = {} ) {
    const context = await super._prepareContext( options );
    return {
      ...context,
      options:       this.edRollOptions,
      optionsFields: this.edRollOptions.schema.fields,
      buttons:       this.buttons,
      tooltips:      {
        stepModifiers: Object.values( this.edRollOptions.step.modifiers ).join( " + " ),
      },
      CONFIG,
      ...this.edRollOptions,
    };
  }

  /** @inheritDoc */
  async _preparePartContext( partId, context, options ) {
    await super._preparePartContext( partId, context, options );

    switch ( partId ) {
      case "base":
        break;
      case "other":
        break;
    }

    return context;
  }

  /** @inheritDoc */
  _onRender( context, options ) {
    this.element
      .querySelectorAll( "#karma-input,#devotion-input" )
      .forEach( ( element ) => {
        element.addEventListener(
          "change",
          this._validateAvailableResource.bind( this ),
        );
      } );
  }

  /**
   * @description                 Validate the available resources.
   * @param {Event} event        The event that triggered the validation.
   */
  _validateAvailableResource( event ) {
    const newValue = event.currentTarget.value;
    const resource = event.currentTarget.dataset.resource;
    if (
      this.edRollOptions.testType !== CONFIG.ED4E.testTypes.arbitrary &&
      newValue > this.edRollOptions[resource].available
    ) {
      ui.notifications.warn(
        `Localize: Not enough ${resource}. You can use it, but only max available will be deducted from current.`,
      );
    }
  }

  /** @inheritDoc */
  static async #onFormSubmission( event, form, formData ) {
    this.edRollOptions.updateSource( formData.object );
    return this.render( true );
  }

  /**
   * @description                Roll the step.
   * @param {Event} event        The event that triggered the roll.
   * @param {HTMLElement} target The target element of the event.
   * @returns {Promise}          The promise of the roll.
   */
  static async _roll( event, target ) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const roll = new EdRoll( undefined, this.rollData, this.edRollOptions );
    this.resolve?.( roll );
    return this.close();
  }
}
