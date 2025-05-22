import ActorSheetEdSentient from "./sentient-sheet.mjs";

/**
 * Extend the basic ActorSheet with modifications
 */
export default class ActorSheetEdNamegiver extends ActorSheetEdSentient {

  static {
    this.addSheetTabs( [
      { id: "talents", },
      { id: "skills", },
      { id: "devotions", },
      { id: "reputation" },
      { id: "classes" },
    ] );
  }

  /** @inheritdoc */
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

  /** @inheritdoc */
  async _prepareContext( options ) {
    const context = await super._prepareContext( options );
    foundry.utils.mergeObject( context, {
      splitTalents:           game.settings.get( "ed4e", "talentsSplit" ),
    } );

    return context;
  }

  /** @inheritdoc */
  async _onDropItem( event, item ) {
    const dataModel = CONFIG.Item.dataModels[item.type];
    const singleton = dataModel?.metadata?.singleton ?? false;
    if ( singleton && this.actor.itemTypes[item.type].length ) {
      ui.notifications.error( game.i18n.format( "ED.Notifications.Error.singleton", {
        itemType:  game.i18n.localize( CONFIG.Item.typeLabels[item.type] ),
        actorType: game.i18n.localize( CONFIG.Actor.typeLabels[this.actor.type] )
      } ) );
      return false;
    }
    return super._onDropItem( event, item );
  }

  // region Actions
  /**
   * This function triggers the half magic roll of an adept.
   * @param {Event} event - The event that triggered the form submission.
   * @param {HTMLElement} target - The HTML element that triggered the action.
   */
  static async rollHalfMagic( event, target ) {
    event.preventDefault();
    ui.notifications.info( "Half magic not done yet" );
    this.document.rollHalfMagic( {event: event} );
  }
}
