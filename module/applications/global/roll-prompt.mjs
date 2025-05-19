import EdRoll from "../../dice/ed-roll.mjs";
import EdRollOptions from "../../data/roll/common.mjs";
import ED4E from "../../config/_module.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class RollPrompt extends HandlebarsApplicationMixin(
  ApplicationV2,
) {
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
    this.edRollOptions.updateSource( {
      "step.modifiers.manual": edRollOptions.step.modifiers.manual ?? 0,
    } );
    this.tabGroups = {
      primary: "base-tab",
    };
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
      icon:  `fa-regular ${ED4E.icons.dice}`,
    },
    actions: {
      roll: this._roll,
    },
    form: {
      handler:        RollPrompt.#onFormSubmission,
      submitOnChange: true,
      closeOnSubmit:  false,
    },
  };

  /** @inheritDoc */
  static PARTS = {
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
      id:       "-tabs-navigation",
      classes:  [ "navigation" ],
    },
    "base-tab": {
      template: "systems/ed4e/templates/prompts/roll-prompt.hbs",
      id:       "-base-input",
      classes:  [ "base-input" ],
    },
    // "other-tab": {
    //   template: "systems/ed4e/templates/placeholder.hbs",
    //   id:       "-other-input",
    //   classes:  [ "other-input" ],
    // },
    footer: {
      template: "templates/generic/form-footer.hbs",
      id:       "-footer",
      classes:  [ "flexrow" ],
    },
  };

  /** @inheritDoc */
  static TABS = {
    "base-tab": {
      id:       "base-tab",
      group:    "primary",
      icon:     "",
      label:    "ED.Dialogs.Tabs.rollPromptBaseTab",
      active:   false,
      cssClass: "",
    },
    "other-tab": {
      id:       "other-tab",
      group:    "primary",
      icon:     "",
      label:    "ED.Dialogs.Tabs.rollPromptOtherTab",
      active:   false,
      cssClass: "",
    },
    initial:     "base-tab",
    labelPrefix: "ED.Sheet.Tabs",
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
      ...this.edRollOptions,
      buttons: this.buttons,
      CONFIG,
    };
  }

  /** @inheritDoc */
  async _preparePartContext( partId, context, options ) {
    await super._preparePartContext( partId, context, options );

    switch ( partId ) {
      case "tabs":
        return this._prepareTabsContext( context, options );
      case "base-tab":
        break;
      case "other-tab":
        break;
    }

    // We only reach it if we're in a tab part
    const tabGroup = "primary";
    context.tab = foundry.utils.deepClone( this.constructor.TABS[partId] );
    if ( this.tabGroups[tabGroup] === context.tab?.id )
      context.tab.cssClass = "active";

    return context;
  }

  /** @inheritDoc */
  async _prepareTabsContext( context, options ) {
    // make a deep copy to guarantee the css classes are always empty before setting it to active
    context.tabs = foundry.utils.deepClone( this.constructor.TABS );
    const tab = this.tabGroups.primary;
    context.tabs[tab].cssClass = "active";

    return context;
  }

  /** @inheritDoc */
  _onRender( context, options ) {
    this.element
      .querySelectorAll( "#karma-input,#devotion-input" )
      .forEach( ( element ) => {
        element.addEventListener(
          "change",
          this._validateAvailableRessource.bind( this ),
        );
      } );
  }

  /**
   * @description                 Validate the available resources.
   * @param {Event} event        The event that triggered the validation.
   */
  _validateAvailableRessource( event ) {
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
