import ED4E from "../../config/_module.mjs";
import ItemSheetEd from "./item-sheet.mjs";

/**
 * Extend the basic ActorSheet with modifications
 */
export default class PhysicalItemSheetEd extends ItemSheetEd {

  /** @inheritDoc */
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
      template:   "templates/generic/tab-navigation.hbs",
      id:         "-tabs-navigation",
      classes:    [ "tabs-navigation" ],
      scrollable: [ "" ],
    },
    "general": {
      template: "systems/ed4e/templates/item/item-partials/item-description.hbs", 
      classes:  [ "general" ] 
    },
    "details": {
      template: "systems/ed4e/templates/item/item-partials/item-details.hbs", 
      classes:  [ "details" ] 
    },
    "effects": {
      template: "systems/ed4e/templates/item/item-partials/item-details/item-effects.hbs", 
      classes:  [ "effects" ] 
    },
    "thread": {
      template:   "systems/ed4e/templates/item/item-partials/item-details/other-tabs/threads.hbs", 
      id:         "-thread",
      classes:    [ "thread" ],
      scrollable: [ "" ], 
    },
  };

  // region TABS
  /** @inheritDoc */
  static TABS = {
    sheet: {
      tabs:        [
        { id:    "general", },
        { id:    "details", },
        { id:    "effects", },
        { id:    "thread", },
      ],
      initial:     "general",
      labelPrefix: "ED.Item.Tabs",
    },
  };
  
  async _preparePartContext( partId, contextInput, options ) {
    const context = await super._preparePartContext( partId, contextInput, options );
    switch ( partId ) {
      case "header":
      case "top":
      case "tabs": 
        break;
      case "general":
        break;
      case "details":
        break;
      case "effects":
        break;
      case "thread":
        break;
    }
    return context;
  }
  
  async _prepareContext( options ) {
    const context = super._prepareContext( options );
    foundry.utils.mergeObject(
      context,
      {
        item:                   this.document,
        system:                 this.document.system,
        options:                this.options,
        systemFields:           this.document.system.schema.fields,
        config:                 ED4E,
        isGM:                   game.user.isGM,
      },
    );
    
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
    this.document.system.threadData.addLevel();
    this.render();
  }
  
  static async deleteThreadLevel( event, target ) {
    event.preventDefault();
    this.document.system.threadData.deleteLevel();
    this.render();
  }

  static async tailorToNamegiver( event, target ) {
    this.document.tailorToNamegiver( this.document.parent.namegiver );
  }
}

