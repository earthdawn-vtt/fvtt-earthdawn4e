import ED4E from "../../config/_module.mjs";
import ItemSheetEd from "./item-sheet.mjs";

const TextEditor = foundry.applications.ux.TextEditor.implementation;

/**
 * Extend the basic ActorSheet with modifications
 */
export default class PhysicalItemSheetEd extends ItemSheetEd {

  // region Static Properties

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    actions:  {
      addThreadLevel:     PhysicalItemSheetEd._onAddThreadLevel,
      castSpell:          PhysicalItemSheetEd._onCastSpell,
      deleteThreadLevel:  PhysicalItemSheetEd._onDeleteThreadLevel,
      tailorToNamegiver:  PhysicalItemSheetEd._onTailorToNamegiver,
    },
  };

  /** @inheritDoc */
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
      classes:  [ "general", "scrollable" ]
    },
    "details": {
      template:   "systems/ed4e/templates/item/item-partials/item-details.hbs",
      classes:    [ "details", "scrollable" ],
      scrollable: [ "" ],
    },
    "effects": {
      template: "systems/ed4e/templates/item/item-partials/item-details/item-effects.hbs",
      classes:  [ "effects", "scrollable" ]
    },
    "thread": {
      template:   "systems/ed4e/templates/item/item-partials/item-details/other-tabs/threads.hbs",
      id:         "-thread",
      classes:    [ "thread", "scrollable" ],
      scrollable: [ "" ],
    },
  };

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
      labelPrefix: "ED.Tabs.ItemSheet",
    },
  };

  // endregion

  // region Rendering

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
        if ( this.document.system.isGrimoire ) {
          context.grimoireSpells = await Promise.all(
            this.document.system.grimoire.spells.map( async spellUuid => fromUuid( spellUuid ) )
          );
        }
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

  // endregion

  // region Drag and Drop


  /** @inheritDoc */
  async _onDropItem( event, item ) {
    await super._onDropItem( event, item );

    let changed = false;

    if ( item.type === "spell" && this.item.system.isGrimoire ) {
      // If the item is a spell and the item is a grimoire, add it to the grimoire
      await this.item.system.addSpellToGrimoire( item );
    }

    if ( changed ) await this.render();
  }

  // endregion

  // region Event Handlers

  /**
   * @type {ApplicationClickAction}
   * @this {PhysicalItemSheetEd}
   */
  static async _onAddThreadLevel( event, target ) {
    event.preventDefault();
    this.document.system.threadData.addLevel();
    this.render();
  }

  /**
   * @type {ApplicationClickAction}
   * @this {PhysicalItemSheetEd}
   */
  static async _onDeleteThreadLevel( event, target ) {
    event.preventDefault();
    this.document.system.threadData.deleteLevel();
    this.render();
  }

  /**
   * @type {ApplicationClickAction}
   * @this {PhysicalItemSheetEd}
   */
  static async _onTailorToNamegiver( event, target ) {
    this.document.tailorToNamegiver( this.document.parent.namegiver );
  }

  /**
   * @type {ApplicationClickAction}
   * @this {PhysicalItemSheetEd}
   */
  static async _onCastSpell( event, target ) {
    event.preventDefault();

    const spell = await this._getEmbeddedDocument( target );
    const actor = this.document.system.containingActor
      ?? game.user.character
      ?? canvas.tokens.controlled[0]?.actor;

    if ( !actor ) {
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.castSpellNoActor" ) );
      return;
    }

    await actor.castSpell( spell );
  }

  // endregion
}

