import ActorSheetEd from "./base-sheet.mjs";
import ED4E from "../../config.mjs";

/**
 * An Actor sheet for player character type actors.
 */
export default class ActorSheetEdCharacter extends ActorSheetEd {

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
    id:       "character-sheet-{id}",
    uniqueId: String( ++globalThis._appId ),
    classes:  [ "character" ],
    actions:  {
      upgradeItem:        ActorSheetEdCharacter.upgradeItem,
      karmaRitual:        ActorSheetEdCharacter.karmaRitual,
      legendPointHistory: ActorSheetEdCharacter.legendPointHistory,
      takeStrain:         ActorSheetEdCharacter.takeStrain,
      halfMagic:          ActorSheetEdCharacter.rollHalfMagic,
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
    "legend-tab": {
      template: "systems/ed4e/templates/actor/actor-tabs/legend.hbs",
      // id:       "legend-tab",
      classes:  [ "tab", "legend" ]
    },
    "classes-tab": {
      template: "systems/ed4e/templates/actor/actor-tabs/classes.hbs",
      // id:       "classes-tab",
      classes:  [ "tab", "classes" ]
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
      "general-tab":    { id: "general-tab", group: "sheet", icon: "fa-solid fa-user", label: "general" },
      "talents-tab":    { id: "talents-tab", group: "sheet", icon: "fa-solid fa-user", label: "talents" },
      "skills-tab":     { id: "skills-tab", group: "sheet", icon: "fa-solid fa-user", label: "skills" },
      "devotions-tab":  { id: "devotions-tab", group: "sheet", icon: "fa-solid fa-user", label: "devotions" },
      "spells-tab":     { id: "spells-tab", group: "sheet", icon: "fa-solid fa-user", label: "spells" },
      "equipment-tab":  { id: "equipment-tab", group: "sheet", icon: "fa-solid fa-user", label: "equipment" },
      "notes-tab":      { id: "notes-tab", group: "sheet", icon: "fa-solid fa-user", label: "notes" },
      "reputation-tab": { id: "reputation-tab", group: "sheet", icon: "fa-solid fa-user", label: "reputation" },
      "specials-tab":   { id: "specials-tab", group: "sheet", icon: "fa-solid fa-user", label: "specials" },
      "legend-tab":     { id: "legend-tab", group: "sheet", icon: "fa-solid fa-user", label: "legend" },
      "classes-tab":    { id: "classes-tab", group: "sheet", icon: "fa-solid fa-user", label: "classes" },
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
      
    context.buttons = [
      {
        type:     "button",
        label:    game.i18n.localize( "ED.Actor.Buttons.halfMagic" ),
        cssClass: "halfMagic",
        icon:     `fas ${ED4E.icons.halfMagic}`,
        action:   "halfMagic",
      },
      {
        type:     "button",
        label:    game.i18n.localize( "ED.Actor.Buttons.initiative" ),
        cssClass: "initiative",
        icon:     `fas ${ED4E.icons.initiative}`,
        action:   "initiative",
      },
      {
        type:     "button",
        label:    game.i18n.localize( "ED.Actor.Buttons.jumpUp" ),
        cssClass: "jumpUp",
        icon:     `fas ${ED4E.icons.jumpUp}`,
        action:   "jumpUp",
      },
      {
        type:     "button",
        label:    game.i18n.localize( "ED.Actor.Buttons.knockDownTest" ),
        cssClass: "knockDownTest",
        icon:     `fas ${ED4E.icons.knockDownTest}`,
        action:   "knockDownTest",
      },
      {
        type:     "button",
        label:    game.i18n.localize( "ED.Actor.Buttons.recovery" ),
        cssClass: "recovery",
        icon:     `fas ${ED4E.icons.recovery}`,
        action:   "recovery",
      },
      {
        type:     "button",
        label:    game.i18n.localize( "ED.Actor.Buttons.takeDamage" ),
        cssClass: "takeDamage",
        icon:     `fas ${ED4E.icons.takeDamage}`,
        action:   "takeDamage",
      },
    ];
  
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
      case "legend-tab":
        break;
      case "classes-tab":
        break;
    }
    context.tab = context.tabs[partId];  
    return context;
  }

  // region Actions
  static async rollHalfMagic( event, target ) {
    event.preventDefault();
    ui.notifications.info( "Half magic not done yet" );
    this.document.rollHalfMagic( {event: event} );
  }

  static async upgradeItem( event, target ) {
    event.preventDefault();
    if ( target.dataset.attribute ) {
      const attribute = target.dataset.attribute;
      await this.document.system.increaseAttribute( attribute );
    } else if ( target.parentElement.dataset.itemId ) {
      const parentId = target.parentElement.dataset.itemId;
      const parent = await this.document.items.get( parentId );
      if ( parent.type !== "class" ) {
        const li = target.closest( ".item-id" );
        const ability = this.document.items.get( li.dataset.itemId );
        if ( typeof ability.system.increase === "function" ) ability.system.increase();
      } else {
        const li = target.closest( ".item-id" );
        const classItem = this.document.items.get( li.dataset.itemId );
        classItem.system.increase();
      }
    }  
  }

  static async karmaRitual( event, target ) {
    this.document.karmaRitual();
  }

  static async legendPointHistory( event, target ) {
    event.preventDefault();
    this.document.legendPointHistory( this.document );
  }

  static async takeStrain( event, target ) {
    event.preventDefault();
    const li = target.closest( ".item-id" );
    const ability = this.document.items.get( li.dataset.itemId );
    const createChatMessage = ability.system.attribute !== "" ? false: ability.name;
    this.document.takeStrain( ability.system.strain, createChatMessage );
  }
}