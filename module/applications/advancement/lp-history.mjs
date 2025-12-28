import LpTrackingData from "../../data/advancement/lp-tracking.mjs";
import LpEarningTransactionData from "../../data/advancement/lp-earning-transaction.mjs";
import ApplicationEd from "../api/application.mjs";
import ED4E from "../../config/_module.mjs";

/**
 * The application responsible for handling Legend Point related interactions and data.
 */
export default class LegendPointHistory extends ApplicationEd {

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
  }

  /**
   * Wait for dialog to be resolved.
   * @param {object} lpHistory                  The lpHistory do display in the prompt.
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

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    id:       "legend-point-history-prompt-{id}",
    uniqueId: String( ++foundry.applications.api.ApplicationV2._appId ),
    classes:  [ "legend-point__history", ],
    window:   {
      icon:  "fa-thin fa-list-timeline",
      title: "ED.Dialogs.Title.lpHistory",
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
    },
    position: {
      width:  1000,
      height: 850,
    },
  };

  /** @inheritdoc */
  static PARTS = {
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    earned: {
      template:   "systems/ed4e/templates/actor/legend-points/history-earned.hbs",
      scrollable: [ "table" ],
    },
    spend: {
      template:   "systems/ed4e/templates/actor/legend-points/history-spend.hbs",
      scrollable: [ "table" ],
    },
    chronological: {
      template:   "systems/ed4e/templates/actor/legend-points/history-chronological.hbs",
      scrollable: [ "table" ],
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
      classes:  [ "flexrow" ],
    }
  };

  /** @inheritdoc */
  static TABS = {
    primary: {
      tabs:        [
        {
          id:       "earned",
          icon:     ED4E.icons.Tabs.lpEarned,
        },
        {
          id:       "spend",
          icon:     ED4E.icons.Tabs.lpSpend,
        },
        {
          id:       "chronological",
          icon:     ED4E.icons.Tabs.lpChronological,
        },
      ],
      initial:     "chronological",
      labelPrefix: "ED.Tabs.LpHistory",
    },
  };

  /** @inheritdoc */
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

  /** @inheritdoc */
  async _preparePartContext( partId, context, options ) {
    await super._preparePartContext( partId, context, options );

    switch ( partId ) {
      case "chronological":
        context.chronologicalHtmlTable = this.lpHistory.getHtmlTable( "chronological", this.sortBy );
        break;
      case "earned":
        context.earningsHtmlTable = this.lpHistory.getHtmlTable( "earnings", this.sortBy );
        break;
      case "spend":
        context.spendingsHtmlTable = this.lpHistory.getHtmlTable( "spendings", this.sortBy );
        break;
    }

    return context;
  }

  /** @inheritdoc */
  _onRender( context, options ) {
    // TODO: @patrick - solve this in css, just hover: visibility: visible, else: hidden
    this.element.querySelectorAll(
      "section.chronological tbody tr"
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

  /**
   * Handles form submission for the lp history dialog.
   * @param {Event} event The event object triggered by the form submission.
   * @param {HTMLElement} form The form element.
   * @param {object} formData The form data.
   */
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

  /**
   * Handles the toggle detail action for the lp history dialog.
   * @param {Event} event The event object triggered by the toggle detail action.
   * @param {HTMLElement} target The target element that triggered the action.
   */
  static async _toggleDetail( event, target ) {
    const group = target.getAttribute( "data-group" );
    const rows = document.querySelectorAll( `tbody[data-group="${ group }"]` );
    for ( const row of rows ) {
      sessionStorage.setItem( `ed4e.lpGroup.${group}`, row.classList.toggle( "hidden" ) ? "hidden" : "" );
    }
  }

  /**
   * manually adding legend points to an actor
   * @param {Event} event The event object triggered by the toggle detail action.
   * @param {HTMLElement} target The target element that triggered the action.
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
        "earned",
        "spend",
        "chronological",
      ],
    } );
  }

  /**
   * Handles the revert button for transactions.
   * @param {Event} event The event object triggered by the revert transactions action.
   * @param {HTMLElement} target The target element that triggered the action.
   */
  static async _revertTransactions( event, target ) {
    this.lpHistory.updateSource(
      this.lpHistory.revertUpdateData( target.dataset.id )
    );

    this.render();
  }

  /**
   * Handles the save changes action for the lp history dialog.
   * @param {Event} event The event object triggered by the save changes action.
   * @param {HTMLElement} target The target element that triggered the action.
   * @returns {Promise} A promise that resolves when the changes are saved.
   */
  static async _saveChanges( event, target ) {
    this.resolve?.( this.lpHistory );
    return this.close();
  }

}
