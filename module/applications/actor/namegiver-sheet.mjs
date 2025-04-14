import ActorSheetEdSentient from "./sentient-sheet.mjs";

/**
 * Extend the basic ActorSheet with modifications
 */
export default class ActorSheetEdNamegiver extends ActorSheetEdSentient {

  /**
   * This is a very specific user function which is not following the pattern of the naming convention.
   * @userFunction UF_ActorSheetEdNamegiver-addSheetTab
   */
  static {
    this.addSheetTabs( [
      { id: "talents", },
      { id: "skills", },
      { id: "devotions", },
      { id: "reputation" },
      { id: "classes" },
    ] );
  }

  /** 
   * @inheritdoc 
   * @userFunction UF_ActorSheetEdNamegiver-defaultOptions
   */
  static DEFAULT_OPTIONS = {
    classes:  [ "earthdawn4e", "sheet", "actor" ],
    window:   {
      frame:          true,
      positioned:     true,
      icon:           false,
      minimizable:    true,
      resizable:      true,
    },
    form: {
      submitOnChange: true,
    },
    actions:  {
      halfmagic:           ActorSheetEdNamegiver.rollHalfMagic,
    },
  };

  /**
   * @inheritdoc
   * @userFunction UF_ActorSheetEdNamegiver-perpareContext
   */
  async _prepareContext( options ) {
    // TODO: überprüfen was davon benötigt wird
    const context = await super._prepareContext( options );
    foundry.utils.mergeObject( context, {
      splitTalents:           game.settings.get( "ed4e", "talentsSplit" ),
    } );

    return context;
  }

  // region Actions
  /**
   * This function triggers the half magic roll of an adept.
   * @param {Event} event - The event that triggered the form submission.
   * @param {HTMLElement} target - The HTML element that triggered the action.
   * @userFunction UF_ActorSheetEdNamegiver-rollHalfMagic
   */
  static async rollHalfMagic( event, target ) {
    event.preventDefault();
    ui.notifications.info( "Half magic not done yet" );
    this.document.rollHalfMagic( {event: event} );
  }
}
