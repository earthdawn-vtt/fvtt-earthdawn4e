import LpTransactionData from "../../data/advancement/lp-transaction.mjs";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class AssignLpPrompt extends HandlebarsApplicationMixin( ApplicationV2 ) {


  /** 
   * @inheritdoc
   * @userFunction UF_AssignLpPrompt-constructor
   */
  constructor( options = {} ) {
    super( options );
    const object = options.object || {};
    this.resolve = options.resolve;
    this.object = {
      selectedActors: object.selectedActors || [],
      amount:         object.amount || "",
      description:    object.description || ""
    };
  }

  
  /** 
   * Displays this application and waits for user input.
   * @param {object} options - Options to configure the prompt.
   * @returns {Promise<any>} - A promise that resolves with the user input.
   * @userFunction UF_AssignLpPrompt-waitPrompt
   */
  static async waitPrompt( options = {} ) {
    return new Promise( ( resolve ) => {
      options.resolve = resolve;
      new this( options ).render( true, { focus: true } );
    } );
  }

  /**
   * @inheritdoc
   * @userFunction UF_AssignLpPrompt-defaultOptions
   */
  static DEFAULT_OPTIONS = {
    id:       "assign-legend-prompt-{id}",
    uniqueId: String( ++foundry.applications.api.ApplicationV2._appId ),
    classes:  [ "earthdawn4e", "assign-legend" ],
    window:   {
      frame: true,
      title: "ED.Dialogs.Title.assignLp",
    },
    actions: {
      assignLP: AssignLpPrompt._assignLP,
    },
    form: {
      handler:        AssignLpPrompt.#onFormSubmission,
      submitOnChange: true, 
      closeOnSubmit:  false,
    },
    position: {
      width:  350,
    },
  };

  /**
   * @inheritdoc
   * @userFunction UF_AssignLpPrompt-parts
   */
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
   * @userFunction UF_AssignLpPrompt-prepareContext
   */
  async _prepareContext( options = {} ) {
    const context = {};
    context.object = this.object;
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

  /**
   * Handles form submission and updates the object with the form data.
   * @param {Event} event - The form submission event.
   * @param {HTMLElement} form - The form element.
   * @param {object} formData - The form data.
   * @returns {Promise<object>} - The updated object.
   * @userFunction UF_AssignLpPrompt-onFormSubmission
   */
  static async #onFormSubmission( event, form, formData ) {
    const data = foundry.utils.expandObject( formData.object );
    // make array if only one actor is selected
    this.object.selectedActors = [].concat( data.selectedActors || [] );
    this.object.amount = data.amount || 0;
    this.object.description = data.description || "No description provided";
    return this.object;
  }

  /**
   * @inheritdoc
   * @userFunction UF_AssignLpPrompt-close
   */
  static async close( options = {} ) {
    this.resolve?.( null );
    return super.close( options );
  }

  /**
   * assigns Legend points to actors
   * @param {Event} event - The event object from the form submission.
   * @returns {Promise<void>} - A promise that resolves when the LP assignment is complete.
   * @userFunction UF_AssignLpPrompt-assignLp
   */
  static async _assignLP( event ) {
    event.preventDefault();
    if ( !this.object.amount ) return ui.notifications.error( game.i18n.localize( "ED.Dialogs.Errors.noLp" ) );
    // await this.submit( { preventRender: true } );

    const { selectedActors, amount, description } = this.object;
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