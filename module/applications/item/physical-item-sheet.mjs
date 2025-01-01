import ED4E from "../../config.mjs";
import ItemSheetEd from "./item-sheet.mjs";

/**
 * Extend the basic ActorSheet with modifications
 * @augments {ItemSheet}
 */
export default class PhysicalItemSheetEd extends ItemSheetEd {
  
  constructor( options = {} ) {
    super( options );
  }

  /**
   * @override
   */

  static DEFAULT_OPTIONS = {
    actions:  {
      tailorToNamegiver:  PhysicalItemSheetEd.tailorToNamegiver,
      addThreadLevel:     PhysicalItemSheetEd.addThreadLevel,
      deleteThreadLevel:  PhysicalItemSheetEd.deleteThreadLevel,
    },
  };

  // region PARTS
  static PARTS = {
    header: { 
      template: "systems/ed4e/templates/item/item-partials/item-section-name.hbs", 
      id:       "item-name",
      classes:  [ "item-name" ] 
    },
    top: { 
      template: "systems/ed4e/templates/item/item-partials/item-section-top.hbs", 
      id:       "top",
      classes:  [ "top" ] 
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
      id:       "-tabs-navigation",
      classes:  [ "tabs-navigation" ],
    },
    "general-tab": { 
      template: "systems/ed4e/templates/item/item-partials/item-description.hbs", 
      classes:  [ "general" ] 
    },
    "details-tab": { 
      template: "systems/ed4e/templates/item/item-partials/item-details.hbs", 
      classes:  [ "details" ] 
    },
    "effects-tab": { 
      template: "systems/ed4e/templates/item/item-partials/item-details/item-effects.hbs", 
      classes:  [ "effects" ] 
    },
    "thread-tab": { 
      template: "systems/ed4e/templates/item/item-partials/item-details/other-tabs/threads.hbs", 
      classes:  [ "thread" ] 
    },
  };
  
  #getTabs() {
    const tabs = {
      "general-tab":     { id: "general-tab", group: "item-sheet", icon: "fa-solid fa-user", label: "general" },
      "details-tab":     { id: "details-tab", group: "item-sheet", icon: "fa-solid fa-user", label: "details" },
      "effects-tab":     { id: "effects-tab", group: "item-sheet", icon: "fa-solid fa-user", label: "effects" },
      "thread-tab":     { id: "thread-tab", group: "item-sheet", icon: "fa-solid fa-user", label: "threads" },
    };
    for ( const v of Object.values( tabs ) ) {
      v.active = this.tabGroups[v.group] === v.id;
      v.cssClass = v.active ? "active" : "";
    }
    return tabs;
  }

  async _preparePartContext( partId, contextInput, options ) {
    const context = await super._preparePartContext( partId, contextInput, options );
    switch ( partId ) {
      case "header":
      case "top":
      case "tabs": 
        break;
      case "general-tab":
        break;
      case "details-tab":
        break;
      case "effects-tab":
        break;
      case "thread-tab":
        break;
    }
    context.tab = context.tabs[partId];
    return context;
  }
  
  async _prepareContext() {
    const context = {
      item:                   this.document,
      system:                 this.document.system,
      options:                this.options,
      systemFields:           this.document.system.schema.fields,
      config:                 ED4E,
    };
    
    context.tabs = this.#getTabs();
  
    context.enrichedDescription = await TextEditor.enrichHTML(
      this.document.system.description.value,
      {
        // Only show secret blocks to owner
        secrets:  this.document.isOwner,
        // rollData: this.document.getRollData
      }
    );
  
    return context;
  }
  
  static async addThreadLevel( event, target ) {
    event.preventDefault();
    this.document.system.thread.addLevel();
    this.render();
  }
  
  static async deleteThreadLevel( event, target ) {
    event.preventDefault();
    this.document.system.thread.deleteLevel();
    this.render();
  }

  static async tailorToNamegiver( event, target ) {
    this.document.tailorToNamegiver( this.document.parent.namegiver );
  }
}

