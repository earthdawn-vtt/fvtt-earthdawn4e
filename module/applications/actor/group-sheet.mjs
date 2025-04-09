import ActorSheetEd from "./common-sheet.mjs";

/**
 * An actor sheet application designed for actors of type "group"
 */
export default class ActorSheetEdGroup extends ActorSheetEd {

  /**
   * this is a very specific user function which is not following the pattern of the naming convention.
   * @userFunction UF_ActorSheetEdGroup-addSheetTab
   */
  static {
    this.addSheetTabs( [
      { id: "description", },
      { id: "equipment", },
      { id: "reputation", },
    ] );
  }

  // region DEFAULT_OPTIONS
  /** 
   * @inheritdoc 
   * @userFunction UF_ActorSheetEdGroup-defaultOptions
   */
  static DEFAULT_OPTIONS = {
    id:       "character-sheet-{id}",
    uniqueId: String( ++foundry.applications.api.ApplicationV2._appId ),
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
  /** 
   * @inheritdoc 
   * @userFunction UF_ActorSheetEdGroup-parts
   */
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
    description: {
      template: "systems/ed4e/templates/actor/actor-tabs/description.hbs",
      classes:  [ "tab", "description" ]
    },
    equipment: {
      template: "systems/ed4e/templates/actor/actor-tabs/equipment.hbs",
      classes:  [ "tab", "equipment" ]
    },
    reputation: {
      template: "systems/ed4e/templates/actor/actor-tabs/reputation.hbs",
      classes:  [ "tab", "reputation" ]
    },
    footer: {
      template: "systems/ed4e/templates/actor/actor-partials/actor-section-buttons.hbs",
      classes:  [ "sheet-footer" ]
    },
  };

  // region _prepareContext
  /** 
   * @inheritdoc 
   * @userFunction UF_ActorSheetEdGroup-prepareContext
   */
  async _prepareContext() {
    return await super._prepareContext();
  }

  // region _prepare Part Context
  /** 
   * @inheritdoc 
   * @userFunction UF_ActorSheetEdGroup-preparePartContext
   */
  async _preparePartContext( partId, contextInput, options ) {
    const context = await super._preparePartContext( partId, contextInput, options );
    switch ( partId ) {
      case "header":
      case "characteristics":
      case "tabs": 
        break;
      case "description":
        break;
      case "equipment":
        break;  
      case "reputation":
        break;
    }
    return context;
  }
}