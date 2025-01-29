import ActorSheetEdSentient from "./sentient-sheet.mjs";

/**
 * Extend the basic ActorSheet with modifications
 * @augments {ActorSheet}
 */
export default class ActorSheetEdDragon extends ActorSheetEdSentient {

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
    classes:  [ "dragon" ],
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
    "talents-tab": {
      template: "systems/ed4e/templates/actor/actor-tabs/talents.hbs",
      // id:       "talents-tab",
      classes:  [ "tab", "talents" ]
    },
    "powers-tab": {
      template: "systems/ed4e/templates/actor/actor-tabs/powers.hbs",
      // id:       "powers-tab",
      classes:  [ "tab", "powers" ]
    },
    "skills-tab": {
      template: "systems/ed4e/templates/actor/actor-tabs/skills.hbs",
      // id:       "skills-tab",
      classes:  [ "tab", "skills" ]
    },
    "devotions-tab": {
      template: "systems/ed4e/templates/actor/actor-tabs/devotions.hbs",
      // id:       "devotions-tab",
      classes:  [ "tab", "devotions" ]
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
    "classes-tab": {
      template: "systems/ed4e/templates/actor/actor-tabs/classes.hbs",
      // id:       "classes-tab",
      classes:  [ "tab", "classes" ]
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
      "talents-tab":       { id: "talents-tab", group: "sheet", icon: "fa-solid fa-user", label: "talents" },
      "powers-tab":        { id: "powers-tab", group: "sheet", icon: "fa-solid fa-user", label: "powers" },
      "skills-tab":        { id: "skills-tab", group: "sheet", icon: "fa-solid fa-user", label: "skills" },
      "devotions-tab":     { id: "devotions-tab", group: "sheet", icon: "fa-solid fa-user", label: "devotions" },
      "spells-tab":        { id: "spells-tab", group: "sheet", icon: "fa-solid fa-user", label: "spells" },
      "equipment-tab":     { id: "equipment-tab", group: "sheet", icon: "fa-solid fa-user", label: "equipment" },
      "notes-tab":         { id: "notes-tab", group: "sheet", icon: "fa-solid fa-user", label: "notes" },
      "reputation-tab":    { id: "reputation-tab", group: "sheet", icon: "fa-solid fa-user", label: "reputation" },
      "specials-tab":      { id: "specials-tab", group: "sheet", icon: "fa-solid fa-user", label: "specials" },
      "configuration-tab":     { id: "configuration-tab", group: "sheet", icon: "fa-solid fa-user", label: "configuration" },
      "classes-tab":       { id: "classes-tab", group: "sheet", icon: "fa-solid fa-user", label: "classes" },
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
      case "talents-tab":
        break;
      case "powers-tab":
        break;
      case "skills-tab":
        break;
      case "devotions-tab":
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
      case "classes-tab":
        break;
    }
    context.tab = context.tabs[partId];  
    return context;
  }
}