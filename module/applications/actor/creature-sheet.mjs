import ActorSheetEdSentient from "./sentient-sheet.mjs";

/**
 * Extend the basic ActorSheet with modifications
 * @augments {ActorSheet}
 */
export default class ActorSheetEdCreature extends ActorSheetEdSentient {

  constructor( options = {} ) {
    super( options );
    this.tabGroups = {
      sheet: "general-tab",
    };
  }

  // region DEFAULT_OPTIONS
  /** 
   * @override 
   */
  static DEFAULT_OPTIONS = {
    id:       "actor-sheet-{id}",
    uniqueId: String( ++globalThis._appId ),
    classes:  [ "creature" ],
    actions:  {
    },
    position: {
      top:    50, 
      left:   220,
      width:  800, 
      height: 800,
    }
  };

  // region PARTS
  static PARTS = {
    header: {
      template: "systems/ed4e/templates/actor/actor-partials/actor-section-name.hbs",
      // id:       "header",
      classes:  [ "sheet-header" ],
    },
    characteristics: {
      template: "systems/ed4e/templates/actor/actor-partials/actor-section-top.hbs",
      // id:       "characteristics",
      classes:  [ "characteristics" ],
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
      // id:       "-tabs-navigation",
      classes:  [ "tabs-navigation" ],
    },
    "general-tab": {
      template:   "systems/ed4e/templates/actor/actor-tabs/general.hbs",
      // id:         "general-tab",
      classes:    [ "tab", "general" ],
    },
    "powers-tab": {
      template: "systems/ed4e/templates/actor/actor-tabs/powers.hbs",
      // id:       "powers-tab",
      classes:  [ "tab", "powers" ]
    },
    "spells-tab": {
      template: "systems/ed4e/templates/actor/actor-tabs/spells.hbs",
      // id:       "spells-tab",
      classes:  [ "tab", "spells" ]
    },
    "equipment-tab": {
      template: "systems/ed4e/templates/actor/actor-tabs/equipment.hbs",
      // id:       "equipment-tab",
      classes:  [ "tab", "equipment" ]
    },
    "notes-tab": {
      template: "systems/ed4e/templates/actor/actor-tabs/notes.hbs",
      // id:       "notes-tab",
      classes:  [ "tab", "notes" ]
    },
    "reputation-tab": {
      template: "systems/ed4e/templates/actor/actor-tabs/reputation.hbs",
      // id:       "reputation-tab",
      classes:  [ "tab", "reputation" ]
    },
    "specials-tab": {
      template: "systems/ed4e/templates/actor/actor-tabs/specials.hbs",
      // id:       "specials-tab",
      classes:  [ "tab", "specials" ]
    },
    "configuration-tab": {
      template: "systems/ed4e/templates/actor/actor-tabs/configuration.hbs",
      // id:       "configuration-tab",
      classes:  [ "tab", "configuration" ]
    },
    footer: {
      template: "systems/ed4e/templates/actor/actor-partials/actor-section-buttons.hbs",
      // id:       "base-tab",
      classes:  [ "sheet-footer" ]
    },
  };

  // region getTabs 
  #getTabs() {
    const tabs = {
      "general-tab":       { id: "general-tab", group: "sheet", icon: "fa-solid fa-user", label: "general" },
      "powers-tab":        { id: "powers-tab", group: "sheet", icon: "fa-solid fa-user", label: "powers" },
      "spells-tab":        { id: "spells-tab", group: "sheet", icon: "fa-solid fa-user", label: "spells" },
      "equipment-tab":     { id: "equipment-tab", group: "sheet", icon: "fa-solid fa-user", label: "equipment" },
      "notes-tab":         { id: "notes-tab", group: "sheet", icon: "fa-solid fa-user", label: "notes" },
      "reputation-tab":    { id: "reputation-tab", group: "sheet", icon: "fa-solid fa-user", label: "reputation" },
      "specials-tab":      { id: "specials-tab", group: "sheet", icon: "fa-solid fa-user", label: "specials" },
      "configuration-tab":     { id: "configuration-tab", group: "sheet", icon: "fa-solid fa-user", label: "configuration" },
    };
    for ( const tab of Object.values( tabs ) ) {
      tab.active = this.tabGroups[tab.group] === tab.id;
      tab.cssClass = tab.active ? "active" : "";
    }
    return tabs;
  }

  // region _prepareContext
  async _prepareContext() {
    const context = await super._prepareContext();
    context.tabs = this.#getTabs();

    return context;
  }

  // region _prepare Part Context
  async _preparePartContext( partId, contextInput, options ) {
    const context = await super._preparePartContext( partId, contextInput, options );
    switch ( partId ) {
      case "header":
      case "characteristics":
      case "tabs": 
        break;
      case "general-tab":
        break;
      case "powers-tab":
        break;
      case "spells-tab":
        break;
      case "equipment-tab":
        break;  
      case "notes-tab":
        break;
      case "reputation-tab":
        break;
      case "specials-tab":
        break;
      case "configuration-tab":
        break;
    }
    context.tab = context.tabs[partId];  
    return context;
  }
}
