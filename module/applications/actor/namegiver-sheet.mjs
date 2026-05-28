import ActorSheetEdSentient from "./sentient-sheet.mjs";
import { getSetting } from "../../helpers/settings.mjs";

/**
 * Extend the basic ActorSheet with modifications
 */
export default class ActorSheetEdNamegiver extends ActorSheetEdSentient {

  static {
    this.addSheetTabs( [
      { id: "talents", },
      { id: "skills", },
      { id: "devotions", },
      { id: "connections" },
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
  };

  /** @inheritdoc */
  async _prepareContext( options ) {
    const context = await super._prepareContext( options );
    foundry.utils.mergeObject( context, {
      splitTalents:           getSetting( "talentsSplit" ),
    }, {
      recursive: false,
    }, );

    return context;
  }

  /** @inheritdoc */
  async _onDropItem( event, item ) {
    const dataModel = CONFIG.Item.dataModels[item.type];
    const singleton = dataModel?.metadata?.singleton ?? false;
    if ( singleton && this.actor.itemTypes[item.type].length ) {
      ui.notifications.error( _loc( "ED.Notifications.Error.singleton", {
        itemType:  _loc( CONFIG.Item.typeLabels[item.type] ),
        actorType: _loc( CONFIG.Actor.typeLabels[this.actor.type] )
      } ) );
      return false;
    }
    return super._onDropItem( event, item );
  }

}
