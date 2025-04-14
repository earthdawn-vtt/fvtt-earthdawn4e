import ActorSheetEd from "./common-sheet.mjs";

/**
 * An actor sheet application designed for actors of type "Loot"
 */
export default class ActorSheetEdLoot extends ActorSheetEd {

  /**
   * This is a very specific user function which is not following the pattern of the naming convention.
   * @userFunction UF_ActorSheetEdLoot-addSheetTab
   */
  static {
    this.addSheetTabs( [
      { id: "description", },
    ] );
  }

  // region DEFAULT_OPTIONS
  /** 
   * @inheritdoc
   * @userFunction UF_ActorSheetEdLoot-defaultOptions
   */
  static DEFAULT_OPTIONS = {
    id:       "character-sheet-{id}",
    uniqueId: String( ++foundry.applications.api.ApplicationV2._appId ),
    classes:  [ "Vehicle" ],
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
   * @userFunction UF_ActorSheetEdLoot-parts
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
    footer: {
      template: "systems/ed4e/templates/actor/actor-partials/actor-section-buttons.hbs",
      classes:  [ "sheet-footer" ]
    },
  };

  // region _prepareContext
  /**
   * @inheritdoc
   * @userFunction UF_ActorSheetEdLoot-prepareContext
   */
  async _prepareContext() {
    return await super._prepareContext();
  }

  // region _prepare Part Context
  /**
   * @inheritdoc
   * @userFunction UF_ActorSheetEdLoot-preparePartContext
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
    }
    return context;
  }
}