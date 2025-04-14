import ED4E from "../../config/_module.mjs";
import ActorSheetEdNamegiver from "./namegiver-sheet.mjs";

/**
 * An actor sheet application designed for actors of type "PC"
 */
export default class ActorSheetEdCharacter extends ActorSheetEdNamegiver {

  /**
   * This is a very specific user function which is not following the pattern of the naming convention.
   * @userFunction UF_ActorSheetEdCharacter-addSheetTab
   */
  static {
    this.addSheetTabs( [
      { id: "legend", },
    ] );
  }

  // region Static Properties

  /**
   * @override 
   * @userFunction UF_ActorSheetEdCharacter-defaultOptions
   */
  static DEFAULT_OPTIONS = {
    id:       "character-sheet-{id}",
    uniqueId: String( ++foundry.applications.api.ApplicationV2._appId ),
    classes:  [ "character" ],
    actions:  {
      upgradeItem:        ActorSheetEdCharacter.upgradeItem,
      karmaRitual:        ActorSheetEdCharacter.karmaRitual,
      legendPointHistory: ActorSheetEdCharacter.legendPointHistory,
      takeStrain:         ActorSheetEdCharacter.takeStrain,
    },
    position: {
      top:    50, 
      left:   220,
      width:  800, 
      height: 800,
    }
  };

  /**
   * @inheritdoc
   * @userFunction UF_ActorSheetEdCharacter-parts
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
    general: {
      template:   "systems/ed4e/templates/actor/actor-tabs/general.hbs",
      classes:    [ "tab", "general" ],
    },
    talents: {
      template: "systems/ed4e/templates/actor/actor-tabs/talents.hbs",
      classes:  [ "tab", "talents" ]
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
      // id:       "notes-tab",
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
    legend: {
      template: "systems/ed4e/templates/actor/actor-tabs/legend.hbs",
      classes:  [ "tab", "legend" ]
    },
    classes: {
      template: "systems/ed4e/templates/actor/actor-tabs/classes.hbs",
      classes:  [ "tab", "classes" ]
    },
    footer: {
      template: "systems/ed4e/templates/actor/actor-partials/actor-section-buttons.hbs",
      // id:       "base-tab",
      classes:  [ "sheet-footer" ]
    },
  };

  // endregion

  // region Rendering

  /**
   * @inheritdoc
   * @userFunction UF_ActorSheetEdCharacter-prepareContext
   */
  async _prepareContext() {
    const context = await super._prepareContext();

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

  /**
   * @inheritdoc
   * @userFunction UF_ActorSheetEdCharacter-preparePartContext
   */
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
      case "legend":
        break;
      case "classes":
        break;
    }
    return context;
  }

  // endregion

  // region Actions

  /**
   * Increase attributes, abilities or classes
   * @param {Event} event - The event that triggered the form submission.
   * @param {HTMLElement} target - The HTML element that triggered the action.
   * @userFunction UF_ActorSheetEdCharacter-upgradeItem
   */
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

  /**
   * Trigger the karma ritual of an adapt
   * @param {Event} event - The event that triggered the form submission.
   * @param {HTMLElement} target - The HTML element that triggered the action.
   * @userFunction UF_ActorSheetEdCharacter-karmaRitual
   */
  static async karmaRitual( event, target ) {
    this.document.karmaRitual();
  }

  /**
   * Open the legend point history
   * @param {Event} event - The event that triggered the form submission.
   * @param {HTMLElement} target - The HTML element that triggered the action.
   * @userFunction UF_ActorSheetEdCharacter-legendPointHistory
   */
  static async legendPointHistory( event, target ) {
    event.preventDefault();
    this.document.legendPointHistory( this.document );
  }

  /**
   * Take strain damage from actions
   * @param {Event} event - The event that triggered the form submission.
   * @param {HTMLElement} target - The HTML element that triggered the action.
   * @userFunction UF_ActorSheetEdCharacter-takeStrain
   */
  static async takeStrain( event, target ) {
    event.preventDefault();
    const li = target.closest( ".item-id" );
    const ability = this.document.items.get( li.dataset.itemId );
    this.document.takeStrain( 
      ability.system.strain,
      ability
    );
  }

  // endregion

  // region Drag and Drop

  /**
   * @inheritdoc 
   * @userFunction UF_ActorSheetEdCharacter-onDropItem
   */
  async _onDropItem( event, item ) {
    if ( item.system.learnable ) return item.system.constructor.learn( this.actor, item );
    return super._onDropItem( event, item );
  }

  // endregion
}