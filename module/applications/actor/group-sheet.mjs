import ActorSheetEd from "./common-sheet.mjs";

/**
 * An Actor sheet for None-Player-Character type actors.
 */
export default class ActorSheetEdGroup extends ActorSheetEd {

  constructor( options = {} ) {
    super( options );
    this.tabGroups = {
      sheet: "description-tab",
    };
  }
    
  // region DEFAULT_OPTIONS
  /** 
   * @override 
   */
  static DEFAULT_OPTIONS = {
    id:       "character-sheet-{id}",
    uniqueId: String( ++globalThis._appId ),
    classes:  [ "Group" ],
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
    "description-tab": {
      template: "systems/ed4e/templates/actor/actor-tabs/description.hbs",
      // id:       "description-tab",
      classes:  [ "tab", "description" ]
    },
    "equipment-tab": {
      template: "systems/ed4e/templates/actor/actor-tabs/equipment.hbs",
      // id:       "equipment-tab",
      classes:  [ "tab", "equipment" ]
    },
    "reputation-tab": {
      template: "systems/ed4e/templates/actor/actor-tabs/reputation.hbs",
      // id:       "reputation-tab",
      classes:  [ "tab", "reputation" ]
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
      "description-tab":         { id: "description-tab", group: "sheet", icon: "fa-solid fa-user", label: "description" },
      "equipment-tab":     { id: "equipment-tab", group: "sheet", icon: "fa-solid fa-user", label: "equipment" },
      "reputation-tab":    { id: "reputation-tab", group: "sheet", icon: "fa-solid fa-user", label: "reputation" },
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
      case "description-tab":
        break;
      case "equipment-tab":
        break;  
      case "reputation-tab":
        break;
    }
    context.tab = context.tabs[partId];  
    return context;
  }
}