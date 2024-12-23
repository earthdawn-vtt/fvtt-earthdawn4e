import ED4E from "../../config.mjs";
// import ClassTemplate from "../../data/item/templates/class.mjs";
import ItemSheetEd from "./item-sheet.mjs";

// noinspection JSClosureCompilerSyntax
/**
 * Extend the basic ActorSheet with modifications
 * @augments {ItemSheet}
 */
export default class ClassItemSheetEd extends ItemSheetEd {
  
  constructor( options = {} ) {
    super( options );
  }

  /**
   * @override
   */

  static DEFAULT_OPTIONS = {
    id:       "item-sheet-{id}",
    uniqueId: String( ++globalThis._appId ),
    classes:  [ "earthdawn4e", "sheet", "item" ],
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
      addClassLevel:     ClassItemSheetEd.addClassLevel,
      deleteClassLevel:  ClassItemSheetEd.deleteClassLevel,

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
    "advancement-tab": { 
      template: "systems/ed4e/templates/item/item-partials/item-details/other-tabs/discipline-advancement.hbs", 
      classes:  [ "advancement" ] 
    },
  };

  #getTabs() {
    const tabs = {
      "general-tab":     { id: "general-tab", group: "item-sheet", icon: "fa-solid fa-user", label: "general" },
      "details-tab":     { id: "details-tab", group: "item-sheet", icon: "fa-solid fa-user", label: "details" },
      "effects-tab":     { id: "effects-tab", group: "item-sheet", icon: "fa-solid fa-user", label: "effects" },
      "advancement-tab":     { id: "advancement-tab", group: "item-sheet", icon: "fa-solid fa-user", label: "advancement" },
    };
    for ( const v of Object.values( tabs ) ) {
      v.active = this.tabGroups[v.group] === v.id;
      v.cssClass = v.active ? "active" : "";
    }
    return tabs;
  }

  // #getClassTabs() {
  //   const classTabs = {
  //     "general-tab":     { id: "general-tab", group: "item-sheet-class", icon: "fa-solid fa-user", label: "general" },
  //     "level1-tab":     { id: "level1-tab", group: "item-sheet-class", icon: "fa-solid fa-user", label: "level1" },
  //     // multiple based on the number of levels
  //   };
  //   for ( const v of Object.values( classTabs ) ) {
  //     v.active = this.tabGroups[v.group] === v.id;
  //     v.cssClass = v.active ? "active" : "";
  //   }
  //   return classTabs;
  // }

  // region _prepare Part Context
  async _preparePartContext( partId, contextInput, options ) {
    const context = await super._preparePartContext( partId, contextInput, options );
    // const classTabs = this.#getClassTabs();
    // if ( partId in classTabs ) {
    //   switch ( partId ) {
    //     case "options":
    //       break;
    //     case "level1":
    //       break;
    //       // continue based on the number of levels
    //   } 
    // }else {
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
      case "advancement-tab":
        break;
    }
    // }
    // context.classTab = context.classTabs[partId];
    context.tab = context.tabs[partId];
    return context;
  }

  async _prepareContext() {
    const context = {
      item:                   this.document,
      system:                 this.document.system,
      options:                this.options,
      systemFields:           this.document.system.schema.fields,
      // enrichment:             await this.document._enableHTMLEnrichment(),
      // enrichmentEmbededItems: await this.document._enableHTMLEnrichmentEmbeddedItems(),
      config:                 ED4E,
    };

    // context = await super._prepareContext();
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

  static async addClassLevel( event, target ) {
    event.preventDefault();
    this.document.system.advancement.addLevel();
    this.render();
  }

  static async deleteClassLevel( event, target ) {
    event.preventDefault();
    this.document.system.advancement.deleteLevel();
    this.render();
  }

}