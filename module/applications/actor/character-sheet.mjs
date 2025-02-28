import ED4E from "../../config/_module.mjs";
import ActorSheetEdNamegiver from "./namegiver-sheet.mjs";

/**
 * An actor sheet application designed for actors of type "PC"
 */
export default class ActorSheetEdCharacter extends ActorSheetEdNamegiver {

  static {
    this.addSheetTabs( [
      { id: "legend", },
    ] );
  }

  // region Static Properties

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
    },
    position: {
      top:    50, 
      left:   220,
      width:  800, 
      height: 800,
    }
  };

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
    this.document.takeStrain( 
      ability.system.strain,
      ability
    );
  }

  // endregion

  // region Drag and Drop



  // endregion
}