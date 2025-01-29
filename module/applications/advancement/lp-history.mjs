import LpTrackingData from "../../data/advancement/lp-tracking.mjs";
import LpEarningTransactionData from "../../data/advancement/lp-earning-transaction.mjs";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * The application responsible for handling Legend Point related interactions and data.
 * @augments ApplicationV2
 * @mixes HandlebarsApplicationMixin
 */
export default class LegendPointHistory extends HandlebarsApplicationMixin( ApplicationV2 ) {

  /**
   * @inheritDoc
   * @param {LpTrackingData} lpHistory          The data model which is the target  to be updated by the form.
   * @param {Partial<Configuration>} [options]  Options used to configure the Application instance.
   * @param {ActorEd} options.actor             The actor to which the lpHistory belongs.
   * @param {Function} options.resolve          The function to call when the dialog is resolved.
   */
  constructor( lpHistory, options = {} ) {
    super( options );
    this.lpHistory = lpHistory ?? new LpTrackingData();
    this.actor = options.actor;
    this.resolve = options.resolve;
    this.SORTING = {
      time: game.i18n.localize( "ED.Dialogs.Sorting.time" ),
      type: game.i18n.localize( "ED.Dialogs.Sorting.type" ),
      item: game.i18n.localize( "ED.Dialogs.Sorting.item" ),
    };
    this.sortBy = "time";
    this.tabGroups = {
      primary: "earned-tab",
    };
  }

  /**
   * Wait for dialog to be resolved.
   * @param {object} lpHistory                The lpHistory do display in the prompt.
   * @param {Partial<Configuration>} [options]  Options used to configure the Application instance.
   * @param {object} [options.actor]            The actor to which the lpHistory belongs.
   * @param {object} [options.resolve]          The function to call when the dialog is resolved.
   */
  static async waitPrompt( lpHistory, options = {} ) {
    return new Promise( ( resolve ) => {
      options.resolve = resolve;
      new this( lpHistory, options ).render( true, { focus: true } );
    } );
  }

  /**
   * @inheritdoc
   */
  static DEFAULT_OPTIONS = {
    id:      "legend-point-history-prompt", 
    classes: [ "earthdawn4e", "legend-point__history" ],
    tag:     "form",
    window:  {
      frame: true,
      icon:  "fa-thin fa-list-timeline",
      title: "X-Localize Legend Point History",
    },
    actions: {
      saveChanges:        this._saveChanges,
      toggleDetail:       this._toggleDetail,
      addEarning:         this._addEarning,
      revertTransactions: this._revertTransactions,
    },
    form: {
      handler:        LegendPointHistory.#onFormSubmission,
      submitOnChange: true,
      closeOnSubmit:  false,
    },
    position: {
      width:  1000,
      height: 850,
    },
  };

  /**
   * @inheritDoc
   */
  static PARTS = {
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    "earned-tab": {
      template:   "systems/ed4e/templates/actor/legend-points/history-earned.hbs",
      scrollable: [ "table" ],
    },
    "spend-tab": {
      template:   "systems/ed4e/templates/actor/legend-points/history-spend.hbs",
      scrollable: [ "table" ],
    },
    "chronological-tab": {
      template:   "systems/ed4e/templates/actor/legend-points/history-chronological.hbs",
      scrollable: [ "table" ],
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
      classes:  [ "flexrow" ],
    }
  };

  /**
   * @type {Record<string, ApplicationTab>}
   */
  static TABS = {
    "earned-tab": {
      id:       "earned-tab",
      group:    "primary",
      icon:     "fa-light fa-hexagon-plus",
      label:    "ED.Dialogs.Legend.LpHistory.tabEarned",
      active:   false,
      cssClass: ""
    },
    "spend-tab": {
      id:       "spend-tab",
      group:    "primary",
      icon:     "fa-light fa-hexagon-minus",
      label:    "ED.Dialogs.Legend.LpHistory.tabSpend",
      active:   false,
      cssClass: ""
    },
    "chronological-tab": {
      id:       "chronological-tab",
      group:    "primary",
      icon:     "fa-light fa-timeline-arrow",
      label:    "ED.Dialogs.Legend.LpHistory.tabChronological",
      active:   false,
      cssClass: ""
    },
  };

  // put _configureRenderOptions here if needed

  /**
   * @inheritdoc
   */
  async _prepareContext( options = {} ) {
    const context = await super._prepareContext( options );
    context.lpHistory = this.lpHistory;
    context.actor = this.actor;
    context.SORTING = this.SORTING;
    context.sortBy = this.sortBy;
    context.object = this.lpHistory;

    context.buttons = [
      {
        type:     "button",
        label:    game.i18n.localize( "ED.Dialogs.Buttons.close" ),
        cssClass: "cancel",
        icon:     "fas fa-times",
        action:   "close",
      },
      {
        type:     "button",
        label:    game.i18n.localize( "ED.Dialogs.Buttons.save" ),
        cssClass: "saveChanges",
        icon:     "fa-light fa-floppy-disk",
        action:   "saveChanges",
      }
    ];

    return context;
  }

  /**
   * @inheritdoc
   */
  async _preparePartContext( partId, context, options ) {
    await super._preparePartContext( partId, context, options );

    switch ( partId ) {
      case "tabs": return this._prepareTabsContext( context, options );
      case "chronological-tab":
        context.chronologicalHtmlTable = this.lpHistory.getHtmlTable( "chronological", this.sortBy );
        break;
      case "earned-tab":
        context.earningsHtmlTable = this.lpHistory.getHtmlTable( "earnings", this.sortBy );
        break;
      case "spend-tab":
        context.spendingsHtmlTable = this.lpHistory.getHtmlTable( "spendings", this.sortBy );
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

  _onRender( context, options ) {
    // TODO: @patrick - solve this in css, just hover: visibility: visible, else: hidden
    this.element.querySelectorAll(
      "section.chronological-tab tbody tr"
    ).forEach( element => {
      element.addEventListener(
        "mouseover",
        () => {
          element.querySelector(
            "i[data-action=\"revertTransactions\"]"
          ).style.visibility = "visible";
        }
      );
      element.addEventListener(
        "mouseout",
        () => {
          element.querySelector(
            "i[data-action=\"revertTransactions\"]"
          ).style.visibility = "hidden";
        }
      );
    } );
  }

  static async #onFormSubmission( event, form, formData ) {
    const data = foundry.utils.expandObject( formData.object );
    const updateData = {};

    /**
     * @description Parse the transaction data to ensure data validity.
     * @param {{}} transactionData The transaction data to parse.
     * @returns {Array<LpTransactionData>} The parsed transaction data.
     */
    function parseTransactionInputs( transactionData ) {
      return Object.values( transactionData ).map( ( transaction ) => {
        if ( transaction.date ) transaction.date = new Date( transaction.date );
        return transaction;
      } );
    }

    if ( data.earnings ) updateData.earnings = parseTransactionInputs( data.earnings );
    if ( data.spendings ) updateData.spendings = parseTransactionInputs( data.spendings );

    this.lpHistory.updateSource( updateData );
    this.sortBy = data.sortBy;
    this.render();
  }

  static async _toggleDetail( event, target ) {
    const group = target.getAttribute( "data-group" );
    const rows = document.querySelectorAll( `tbody[data-group="${ group }"]` );
    for ( const row of rows ) {
      sessionStorage.setItem( `ed4e.lpGroup.${group}`, row.classList.toggle( "hidden" ) ? "hidden" : "" );
    }
  }

  /**
   * manually adding legend points to an actor
   * @userFunction UF_LpTracking-addEarnings
   */

  static async _addEarning( event, target ) {
    const transaction = new LpEarningTransactionData( {
      amount:      0,
      date:        Date.now(),
      description: "💕",
    } );
    this.lpHistory.updateSource( {
      earnings: [ ...this.lpHistory.earnings, transaction ],
    } );

    this.render( {
      parts: [
        "earned-tab",
        "spend-tab",
        "chronological-tab",
      ],
    } );
  }

  static async _revertTransactions( event, target ) {
    this.lpHistory.updateSource(
      this.lpHistory.revertUpdateData( target.dataset.id )
    );

    this.render();
  }

  static async _saveChanges( event, target ) {
    this.resolve?.( this.lpHistory );
    return this.close();
  }

}
