import ActorSheetEdSentient from "./sentient-sheet.mjs";

/**
 * Extend the basic ActorSheet with modifications
 */
export default class ActorSheetEdSpirit extends ActorSheetEdSentient {

  static {
    this.addSheetTabs( [
      { id: "talents", },
      { id: "powers", },
      { id: "skills", },
      { id: "devotions", },
      { id: "reputation" },
      { id: "configuration" },
    ] );
  }

  // region DEFAULT_OPTIONS
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    id:       "actor-sheet-{id}",
    uniqueId: String( ++foundry.applications.api.ApplicationV2._appId ),
    classes:  [ "spirit" ],
    actions:  {
    },
    position: {
      top:    50, 
      left:   220,
      width:  750, 
      height: 885,
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
    talents: {
      template: "systems/ed4e/templates/actor/actor-tabs/talents.hbs",
      classes:  [ "tab", "talents" ]
    },
    powers: {
      template: "systems/ed4e/templates/actor/actor-tabs/powers.hbs",
      classes:  [ "tab", "powers" ]
    },
    skills: {
      template: "systems/ed4e/templates/actor/actor-tabs/skills.hbs",
      classes:  [ "tab", "skills" ]
    },
    devotions: {
      template: "systems/ed4e/templates/actor/actor-tabs/devotions.hbs",
      classes:  [ "tab", "devotions" ]
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
    reputation: {
      template: "systems/ed4e/templates/actor/actor-tabs/reputation.hbs",
      classes:  [ "tab", "reputation" ]
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
      case "talents":
        break;
      case "powers":
        break;
      case "skills":
        break;
      case "devotions":
        break;
      case "spells":
        break;
      case "equipment":
        break;  
      case "notes":
        break;
      case "reputation":
        break;
      case "specials":
        break;
      case "configuration":
        break;
    }
    return context;
  }
}

