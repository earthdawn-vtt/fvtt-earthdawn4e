import ED4E from "../../config/_module.mjs";
import ItemSheetEd from "./item-sheet.mjs";

// noinspection JSClosureCompilerSyntax
/**
 * Extend the basic ActorSheet with modifications
 * @augments {ItemSheet}
 */
export default class ClassItemSheetEd extends ItemSheetEd {
  
  /**
   * @inheritDoc 
   * @userFunction UF_ClassItemSheetEd-defaultOptions
   */
  static DEFAULT_OPTIONS = {
    id:       "item-sheet-{id}",
    uniqueId: String( ++foundry.applications.api.ApplicationV2._appId ),
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
  /** 
   * @inheritDoc 
   * @userFunction UF_ClassItemSheetEd-parts
   */
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
      template:   "systems/ed4e/templates/item/item-partials/item-description.hbs", 
      classes:    [ "general", "scrollable" ],
      scrollable: [ "" ], 
    },
    "details": {
      template:   "systems/ed4e/templates/item/item-partials/item-details.hbs", 
      classes:    [ "details", "scrollable" ],
      scrollable: [ "" ], 
    },
    "effects": {
      template:   "systems/ed4e/templates/item/item-partials/item-details/item-effects.hbs", 
      classes:    [ "effects", "scrollable" ],
      scrollable: [ "" ],
    },
    "advancement": {
      template:   "systems/ed4e/templates/item/item-partials/item-details/other-tabs/discipline-advancement.hbs", 
      classes:    [ "advancement", "scrollable" ],
      scrollable: [ "" ],
    },
  };

  // region TABS
  /** 
   * @inheritDoc 
   * @userFunction UF_ClassItemSheetEd-tabs
   */
  static TABS = {
    sheet: {
      tabs: [
        { id:    "general", },
        { id:    "details", },
        { id:    "effects", },
        { id:    "advancement", },
      ],
      initial:     "general",
      labelPrefix: "ED.Sheet.Tabs",
    },
  };

  
  /** 
   * Creating the tabs for the class advancement tab group.
   * @returns {object} tabs for the class advancement tab group
   * @userFunction UF_ClassItemSheetEd-getClassTabs
   */
  #getClassTabs() {
    const labelPrefix = "ED.Item.Tabs";
    
    const classTabs = {
      "options":     {
        id:    "options",
        group: "classAdvancements",
        label: `${labelPrefix}.talentOptions`,
      },
    };
    for ( let levelIndex = 1; levelIndex <= this.document.system.advancement.levels.length; levelIndex++ ) {
      classTabs[`level${levelIndex}`] = {
        id:    `level${levelIndex}`,
        group: "classAdvancements",
        label: `${labelPrefix}.level`,
        level: levelIndex,
      };
    }

    for ( const tab of Object.values( classTabs ) ) {
      tab.active = this.tabGroups[tab.group] === tab.id;
      tab.cssClass = tab.active ? "active" : "";
    }

    return classTabs;
  }

  // region _prepare Part Context
  /** 
   * @inheritDoc 
   * @userFunction UF_ClassItemSheetEd-preparePartContext
   */
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
      case "advancement":
        foundry.utils.mergeObject(
          context,
          {
            tabs: {
              classAdvancements: this.#getClassTabs(),
            }
          },
        );
        break;
    }
    return context;
  }

  /**
   * @inheritdoc
   * @userFunction UF_ClassItemSheetEd-prepareContext
   */
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

  /**
   * Add level to the class advancement.
   * @param {Event} event The form submission event.
   * @param {HTMLElement} target The form element.
   * @userFunction UF_ClassItemSheetEd-addClassLevel 
   */
  static async addClassLevel( event, target ) {
    event.preventDefault();
    await this.document.system.advancement.addLevel();
    this.render();
  }

  /**
   * Delete the highest level of the class advencement.
   * @param {Event} event The form submission event.
   * @param {HTMLElement} target The form element.
   * @userFunction UF_ClassItemSheetEd-deleteClassLevel
   */
  static async deleteClassLevel( event, target ) {
    event.preventDefault();
    const oldMaxLevel = this.document.system.advancement.levels.length;
    const newTab = ( oldMaxLevel - 1 ) > 0 ? `level${oldMaxLevel - 1}` : "options";
    await this.document.system.advancement.deleteLevel();
    if ( this.tabGroups.classAdvancements === `level${oldMaxLevel}` ) this.changeTab( newTab, "classAdvancements" );
    // this.render( { parts: [ "advancement" ] } );
  }

}