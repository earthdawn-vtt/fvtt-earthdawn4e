import LpTransactionData from "../../data/advancement/lp-transaction.mjs";
import ApplicationEd from "../api/application.mjs";

export default class AssignLpPrompt extends ApplicationEd {


  /** @inheritdoc */
  constructor( options = {} ) {
    super( options );
    const data = options.data || {};
    this.resolve = options.resolve;
    this._data = {
      selectedActors: data.selectedActors || [],
      amount:         data.amount || "",
      description:    data.description || ""
    };
  }

  
  /** 
   * Displays this application and waits for user input.
   * @param {object} options - Options to configure the prompt.
   * @returns {Promise<any>} - A promise that resolves with the user input.
   */
  static async waitPrompt( options = {} ) {
    return new Promise( ( resolve ) => {
      options.resolve = resolve;
      new this( options ).render( true, { focus: true } );
    } );
  }

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    id:       "assign-legend-prompt-{id}",
    uniqueId: String( ++foundry.applications.api.ApplicationV2._appId ),
    classes:  [ "assign-legend", ],
    window:   {
      title: "ED.Dialogs.Title.assignLp",
    },
    actions: {
      assignLP: AssignLpPrompt._assignLP,
    },
    form: {
      submitOnChange: true,
    },
    position: {
      width:  350,
    },
  };

  /** @inheritdoc */
  static PARTS = {
    form: {
      template: "systems/ed4e/templates/prompts/assign-legend.hbs",
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
      classes:  [ "flexrow" ],
    }
  };

  /**
   * Prepare the data to be used in the template
   * @param {object} options - Options to be used in the template
   * @returns {object} - The data to be used in the template
   */
  async _prepareContext( options = {} ) {
    const context = {};
    context.object = this._data;
    context.user = game.users.filter( u => u.active );

    const actorUserActive = game.users.filter(
      u => u.active && u.character
    ).map(
      user => ( {actorId: user.character.id, actorName: user.character.name, playerName: user.name}
      )
    );
    const actorUserInactive =  game.users.filter(
      u => !u.active && u.character
    ).map(
      user => ( {actorId: user.character.id, actorName: user.character.name, playerName: user.name} )
    );
    const notGMs = game.users.filter( user => !user.isGM );
    const actorsOwnedNotConfigured = game.actors.filter(
      actor => notGMs.map(
        user => actor.testUserPermission( user,"OWNER" ) && user.character?.id !== actor.id
      ).some( Boolean )
    ).map(
      actor => ( {actorId: actor.id, actorName: actor.name} )
    );
    context.actorUserActive = actorUserActive;
    context.actorUserInactive = actorUserInactive;
    context.actorsNoUserConfigured = actorsOwnedNotConfigured;

    context.buttons = [
      {
        type:     "button",
        label:    game.i18n.localize( "ED.Dialogs.Buttons.cancel" ),
        cssClass: "cancel",
        icon:     "fas fa-times",
        action:   "close",
      },
      {
        type:     "button",
        label:    game.i18n.localize( "ED.Dialogs.Buttons.ok" ),
        cssClass: "assignLP",
        icon:     "fas fa-check",
        action:   "assignLP",
      }
    ];

    return context;
  }

  /** @inheritDoc */
  static async _processSubmitData( event, form, formData, submitOptions ) {
    const data = super._processSubmitData( event, form, formData, submitOptions );
    // make array if only one actor is selected
    data.selectedActors = [].concat( data.selectedActors || [] );
    data.amount = data.amount || 0;
    data.description = data.description || "No description provided";
    return data;
  }

  /** @inheritdoc */
  static async close( options = {} ) {
    this.resolve?.( null );
    return super.close( options );
  }

  /**
   * assigns Legend points to actors
   * @param {Event} event - The event object from the form submission.
   * @returns {Promise<void>} - A promise that resolves when the LP assignment is complete.
   */
  static async _assignLP( event ) {
    event.preventDefault();
    if ( !this._data.amount ) return ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.noLp" ) );
    // await this.submit( { preventRender: true } );

    const { selectedActors, amount, description } = this._data;
    const transactionData = selectedActors.reduce( ( obj, actorId ) => {
      if ( !actorId ) return obj; // Skip if actorId is null
      const actor = game.actors.get( actorId );
      if ( !actor ) return obj; // Skip if actor is not found
      return {
        ...obj,
        [actorId]: new LpTransactionData( {
          amount,
          description,
        } ),
      };
    }, {} );

    this.resolve?.( transactionData );
    return this.close();
  }
}