import ED4E from "../../config/_module.mjs";
import ItemSheetEd from "./item-sheet.mjs";
import TruePatternData from "../../data/thread/true-pattern.mjs";
import PromptFactory from "../global/prompt-factory.mjs";

const TextEditor = foundry.applications.ux.TextEditor.implementation;

/**
 * Extend the basic ActorSheet with modifications
 */
export default class PhysicalItemSheetEd extends ItemSheetEd {

  // region Static Properties

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    actions:  {
      addThreadItemLevel:               PhysicalItemSheetEd._onAddThreadItemLevel,
      addTruePattern:                   PhysicalItemSheetEd._onAddTruePattern,
      castSpell:                        PhysicalItemSheetEd._onCastSpell,
      deleteThreadItemLevel:            PhysicalItemSheetEd._onDeleteThreadItemLevel,
      deleteTruePattern:                PhysicalItemSheetEd._onDeleteTruePattern,
      itemHistoryCheck:                 PhysicalItemSheetEd._onItemHistoryCheck,
      researchCheck:                    PhysicalItemSheetEd._onResearchCheck,
      tailorToNamegiver:                PhysicalItemSheetEd._onTailorToNamegiver,
      toggleRankKnowledgeKnownToPlayer: PhysicalItemSheetEd._onToggleRankKnowledgeKnownToPlayer,
      toggleRankKnownToPlayer:          PhysicalItemSheetEd._onToggleRankKnownToPlayer,
      toggleTruePatternKnownToPlayer:   PhysicalItemSheetEd._onToggleTruePatternKnownToPlayer,
      weaveThread:                      PhysicalItemSheetEd._onWeaveThread,
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
    "true-pattern": {
      template:   "systems/ed4e/templates/item/item-partials/item-details/other-tabs/true-pattern.hbs",
      id:         "-true-pattern",
      classes:    [ "true-pattern", "scrollable" ],
      scrollable: [ "", "div.truePatternInputs", ],
    },
  };

  /** @inheritDoc */
  static TABS = {
    sheet: {
      tabs:        [
        { id:    "general", },
        { id:    "details", },
        { id:    "effects", },
        { id:    "true-pattern", },
      ],
      initial:     "general",
      labelPrefix: "ED.Tabs.ItemSheet",
    },
  };

  // endregion

  // region Rendering

  /** @inheritDoc */
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
      case "true-pattern":
        context.showTruePattern = this.document.system.truePattern !== null
          && ( game.user.isGM || this.document.system.truePattern?.knownToPlayer );
        break;
    }
    return context;
  }

  /** @inheritDoc */
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
  static async _onAddThreadItemLevel( event, target ) {
    event.preventDefault();
    await this.document.system.truePattern.addThreadItemLevel();
    await this.render();
  }

  /**
   * @type {ApplicationClickAction}
   * @this {PhysicalItemSheetEd}
   */
  static async _onAddTruePattern( event, target ) {
    event.preventDefault();
    await this.document.update( {
      "system.truePattern": new TruePatternData(),
    } );
    await this.render();
  }

  /**
   * @type {ApplicationClickAction}
   * @this {PhysicalItemSheetEd}
   */
  static async _onDeleteThreadItemLevel( event, target ) {
    event.preventDefault();
    const confirmedDelete = await PromptFactory.genericDeleteConfirmationPrompt(
      this.document.system.schema.fields.truePattern.fields.threadItemLevels.label,
      event.shiftKey,
    );
    if ( !confirmedDelete ) return;

    await this.document.system.truePattern.removeLastThreadItemLevel();
    await this.render();
  }

  /**
   * @type {ApplicationClickAction}
   * @this {PhysicalItemSheetEd}
   */
  static async _onDeleteTruePattern( event, target ) {
    event.preventDefault();
    const confirmedDelete = await PromptFactory.genericDeleteConfirmationPrompt(
      this.document.system.schema.fields.truePattern.label,
      event.shiftKey,

    );
    if ( !confirmedDelete ) return;

    await this.document.update( {
      "system.truePattern": null,
    } );
    await this.render();
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

  /**
   * @type {ApplicationClickAction}
   * @this {PhysicalItemSheetEd}
   */
  static async _onToggleRankKnowledgeKnownToPlayer( event, target ) {
    event.preventDefault();
    const level = target.closest( "fieldset[data-level]" ).dataset.level;

    await this.document.system.truePattern.toggleRankKnowledgeKnownToPlayer( level );
  }

  /**
   * @type {ApplicationClickAction}
   * @this {PhysicalItemSheetEd}
   */
  static async _onToggleRankKnownToPlayer( event, target ) {
    event.preventDefault();
    const level = target.closest( "fieldset[data-level]" ).dataset.level;

    await this.document.system.truePattern.toggleRankKnownToPlayer( level );
  }

  /**
   * @type {ApplicationClickAction}
   * @this {PhysicalItemSheetEd}
   */
  static async _onToggleTruePatternKnownToPlayer( event, target ) {
    event.preventDefault();
    const currentValue = this.document.system.truePattern?.knownToPlayer;

    if ( foundry.utils.getType( currentValue ) === "boolean" ) await this.document.update( {
      "system.truePattern.knownToPlayer": !currentValue,
    } );
  }

  /**
   * @type {ApplicationClickAction}
   * @this {ThreadItemSheet}
   */
  static async _onItemHistoryCheck( event, target ) {
    ui.notifications.info( "Not implemented yet." );
  }

  /**
   * @type {ApplicationClickAction}
   * @this {ThreadItemSheet}
   */
  static async _onResearchCheck( event, target ) {
    ui.notifications.info( "Not implemented yet." );
  }

  /**
   * @type {ApplicationClickAction}
   * @this {ThreadItemSheet}
   */
  static async _onWeaveThread( event, target ) {
    event.preventDefault();

    const actor = this.document.system.containingActor
      ?? game.user.character
      ?? canvas.tokens.controlled[0]?.actor
      ?? await PromptFactory.chooseActorPrompt(
        [],
        game.user.isGM ? "" : "character",
        {}
      );
    if ( !actor ) {
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.weaveThreadNoActor" ) );
      return;
    }

    await actor.weaveThread( this.document );
  }

  // endregion
}

