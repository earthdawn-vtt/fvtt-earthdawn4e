import EdRoll from "../../dice/ed-roll.mjs";
import EdRollOptions from "../../data/roll/common.mjs";
import ED4E from "../../config.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class RollPrompt extends HandlebarsApplicationMixin( ApplicationV2 ) {

  constructor( edRollOptions = {}, { resolve, rollData = {}, options = {} } = {} ) {
    if ( !( edRollOptions instanceof EdRollOptions ) ) {
      throw new TypeError( "ED4E | Cannot construct RollPrompt from data. Must be of type `RollOptions`." );
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
   * @userFunction                UF_Rolls-rollStepPrompt
   */
  static rollArbitraryPrompt() {
    RollPrompt.waitPrompt(
      new EdRollOptions( {
        testType:   "arbitrary",
        chatFlavor: game.i18n.localize( "ED.Chat.Header.arbitraryTest" ),
      } )
    ).then(
      ( roll ) => roll?.toMessage()
    );
  }

  static DEFAULT_OPTIONS = {
    id:       "roll-prompt-{id}",
    uniqueId: String( ++globalThis._appId ),
    classes:  [ "earthdawn4e", "roll-prompt" ],
    tag:      "form",
    position: {
      width:  "auto",
      height: "auto",
    },
    window:   {
      frame: true,
      title: "ED.Dialogs.Title.rollPrompt",
      icon:  `fa-regular ${ED4E.icons.dice}`,
    },
    actions: {
      roll: this._roll,
    },
    form:    {
      handler:        RollPrompt.#onFormSubmission,
      submitOnChange: true,
      closeOnSubmit:  false,
    },
  };

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

  /**
   * @type {Record<string, ApplicationTab>}
   */
  static TABS = {
    "base-tab": {
      id:       "earned-tab",
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
  };

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
    }
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

  async _preparePartContext( partId, context, options ) {
    await super._preparePartContext( partId, context, options );

    switch ( partId ) {
      case "tabs": return this._prepareTabsContext( context, options );
      case "base-tab":
        break;
      case "other-tab":
        break;
    }

    // We only reach it if we're in a tab part
    const tabGroup = "primary";
    context.tab = foundry.utils.deepClone( this.constructor.TABS[partId] );
    if ( this.tabGroups[tabGroup] === context.tab?.id ) context.tab.cssClass = "active";

    return context;
  }

  async _prepareTabsContext( context, options ) {
    // make a deep copy to guarantee the css classes are always empty before setting it to active
    context.tabs = foundry.utils.deepClone( this.constructor.TABS );
    const tab = this.tabGroups.primary;
    context.tabs[tab].cssClass = "active";

    return context;
  }

  /** @inheritDoc */
  _onRender( context, options ) {
    this.element.querySelectorAll( "#karma-input,#devotion-input" ).forEach( element => {
      element.addEventListener( "change", this._validateAvailableRessource.bind( this ) );
    } );
  }

  _validateAvailableRessource( event ) {
    const newValue = event.currentTarget.value;
    const resource = event.currentTarget.dataset.resource;
    if (
      this.edRollOptions.testType !== CONFIG.ED4E.testTypes.arbitrary
      && newValue > this.edRollOptions[resource].available
    ) {
      ui.notifications.warn( `Localize: Not enough ${resource}. You can use it, but only max available will be deducted from current.` );
    }
  }

  static async #onFormSubmission( event, form, formData ) {
    this.edRollOptions.updateSource( formData.object );
    return this.render( true );
  }

  static async _roll( event, target ) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const roll = new EdRoll( undefined, this.rollData, this.edRollOptions );
    this.resolve?.( roll );
    return this.close();
  }
}


/**
 * The application responsible for handling additional data for rolling dice in Earthdawn.
 * @augments {FormApplication}
 * @param {EdRollOptions} edRollOptions         Some object which is the target data structure to be updated by the form.
 * @param {object} [rollData={}]                The data object that will be passed to {@link Roll}'s `data` argument.
 * @param {FormApplicationOptions} [options={}] Additional options which modify the rendering of the sheet.
 */
export class RollPromptV1 extends FormApplication {

  constructor( edRollOptions = {},  { resolve, rollData = {}, options = {} } = {} ) {
    if ( !( edRollOptions instanceof EdRollOptions ) ) {
      throw new TypeError( "ED4E | Cannot construct RollPrompt from data. Must be of type `RollOptions`." );
    }
    super( edRollOptions, options );

    this.resolve = resolve;
    this.edRollOptions = edRollOptions;
    this.rollData = rollData;
    this._updateObject( undefined, {
      "step.modifiers.manual": edRollOptions.step.modifiers.manual ?? 0,
    } );
  }

  /**
   * Wait for dialog to be resolved.
   * @param {object} [data]           Initial data to pass to the constructor.
   * @param {object} [options]        Options to pass to the constructor.
   * @returns {Promise<EdRoll|null>}  Created roll instance or `null`.
   */
  static waitPrompt( data, options = {} ) {
    return new Promise( ( resolve ) => {
      options.resolve = resolve;
      new this( data, options ).render( true, { focus: true } );
    } );
  }

  /**
   * @description                 Roll a step prompt.
   * @userFunction                UF_Rolls-rollStepPrompt
   */
  static rollArbitraryPrompt() {
    RollPrompt.waitPrompt(
      new EdRollOptions( {
        testType:   "arbitrary",
        chatFlavor: game.i18n.localize( "ED.Chat.Header.arbitraryTest" ),
      } )
    ).then(
      ( roll ) => roll?.toMessage()
    );
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      closeOnSubmit:  false,
      submitOnChange: true,
      submitOnClose:  false,
      height:         500,
      width:          500,
      resizable:      true,
      classes:        [ ...options.classes, "earthdawn4e", "roll-prompt" ],
      tabs:           [
        {
          navSelector:     ".prompt-tabs",
          contentSelector: ".tab-body",
          initial:         "base-input",
        },
      ],
    };
  }

  get title() {
    return game.i18n.localize( "ED.Dialogs.Title.rollPrompt" );
  }

  get template() {
    return "systems/ed4e/templates/prompts/roll-prompt.hbs";
  }

  /** @type {EdRollOptions} */
  edRollOptions = {};

  /** @inheritDoc */
  activateListeners( html ) {
    super.activateListeners( html );
    $( this.form.querySelector( "button.cancel" ) ).on( "click" , this.close.bind( this ) );
    $( this.form.querySelector( "button.ok" ) ).on( "click" , this._createRoll.bind( this ) );
    $( this.form.querySelectorAll( "#karma-input,#devotion-input" ) ).on(
      "change", this._validateAvailableRessource.bind( this )
    );
  }

  /** @inheritDoc */
  async close( options = {} ) {
    this.resolve?.( null );
    return super.close( options );
  }

  /** @inheritDoc */
  getData( options = {} ) {
    return {
      ...this.edRollOptions,
      CONFIG
    };
  }

  /** @inheritDoc */
  async _updateObject( event, formData ) {
    return Promise.resolve( this._updateRollData( formData ) ).then( this.render( true ) );
  }

  _validateAvailableRessource( event ) {
    const newValue = event.currentTarget.value;
    const resource = event.currentTarget.dataset.resource;
    if (
      this.edRollOptions.testType !== CONFIG.ED4E.testTypes.arbitrary
      && newValue > this.edRollOptions[resource].available
    ) {
      ui.notifications.warn( `Localize: Not enough ${resource}. You can use it, but only max available will be deducted from current.` );
    }
  }

  _updateRollData( data = {} ) {
    this.edRollOptions.updateSource( data );
    return this.edRollOptions;
  }

  /**
   * @description                 Create a new roll instance and resolve the dialog.
   * @param {Event} event         The triggering event.
   * @returns {Promise<EdRoll>}   Created roll instance.
   * @userFunction                UF_Rolls-createRoll
   */
  async _createRoll( event ) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    await this.submit( {preventRender: true} );

    const roll = new EdRoll( undefined, this.rollData, this.edRollOptions );
    this.resolve?.( roll );
    return this.close();
  }
}