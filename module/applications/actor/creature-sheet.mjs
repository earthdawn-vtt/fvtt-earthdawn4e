import ActorSheetEdSentient from "./sentient-sheet.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

/**
 * Extend the basic ActorSheet with modifications
 */
export default class ActorSheetEdCreature extends ActorSheetEdSentient {

  static {
    this.addSheetTabs( [
      { id: "powers", },
      { id: "connections", },
      { id: "configuration", },
    ] );
  }

  // region DEFAULT_OPTIONS
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    id:       "actor-sheet-{id}",
    uniqueId: String( ++foundry.applications.api.ApplicationV2._appId ),
    classes:  [ SYSTEM_TYPES.Actor.creature, ],
    actions:  {
    },
    position: {
      top:    50, 
      left:   220,
      width:  750, 
      height: 890,
    }
  };

  // region PARTS
  /** @inheritdoc */
  static PARTS = {
    header: {
      template: "systems/ed4e/templates/actor/actor-partials/actor-section-name.hbs",
      classes:  [ "sheet-header" ],
    },
    characteristics: {
      template: "systems/ed4e/templates/actor/actor-partials/actor-section-top.hbs",
      classes:  [ "characteristics" ],
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
      classes:  [ "tabs-navigation" ],
    },
    general: {
      template:   "systems/ed4e/templates/actor/actor-tabs/general.hbs",
      classes:    [ "tab", "general" ],
    },
    powers: {
      template: "systems/ed4e/templates/actor/actor-tabs/powers.hbs",
      classes:  [ "tab", "powers" ]
    },
    spells: {
      template: "systems/ed4e/templates/actor/actor-tabs/spells.hbs",
      classes:  [ "tab", "spells" ]
    },
    equipment: {
      template: "systems/ed4e/templates/actor/actor-tabs/equipment.hbs",
      classes:  [ "tab", "equipment" ]
    },
    notes: {
      template: "systems/ed4e/templates/actor/actor-tabs/notes.hbs",
      classes:  [ "tab", "notes" ]
    },
    connections: {
      template: "systems/ed4e/templates/actor/actor-tabs/connections.hbs",
      classes:  [ "tab", "connections" ]
    },
    specials: {
      template: "systems/ed4e/templates/actor/actor-tabs/specials.hbs",
      classes:  [ "tab", "specials" ]
    },
    configuration: {
      template: "systems/ed4e/templates/actor/actor-tabs/configuration.hbs",
      classes:  [ "tab", "configuration" ]
    },
  };

  // region _prepareContext
  /** @inheritdoc */
  async _prepareContext() {
    return await super._prepareContext();
  }

  // region _prepare Part Context
  /** @inheritdoc */
  async _preparePartContext( partId, contextInput, options ) {
    const context = await super._preparePartContext( partId, contextInput, options );
    switch ( partId ) {
      case "header":
      case "characteristics":
      case "tabs": 
        break;
      case "general":
        break;
      case "powers":
        break;
      case "spells":
        break;
      case "equipment":
        break;  
      case "notes":
        break;
      case "connections":
        break;
      case "specials":
        break;
      case "configuration":
        break;
    }
    return context;
  }
}
