import SpellEnhancementsConfig from "../configs/spell-enhancements-config.mjs";
import ConstraintsConfig from "../configs/constraints-config.mjs";
import DocumentSheetMixinEd from "../api/document-sheet-mixin.mjs";

/** @import from @

const { ItemSheetV2 } = foundry.applications.sheets;
const { TextEditor } = foundry.applications.ux;
const { HTMLDocumentTagsElement }= foundry.applications.elements;


// noinspection JSClosureCompilerSyntax
/**
 * Extend the basic ActorSheet with modifications
 * @augments {ItemSheetV2}
 * @mixes DocumentSheetMixinEd
 */
export default class ItemSheetEd extends DocumentSheetMixinEd( foundry.applications.sheets.ItemSheetV2 ) {

  // region Static Properties
  static DEFAULT_OPTIONS = {
    id:       "item-sheet-{id}",
    uniqueId: String( ++foundry.applications.api.ApplicationV2._appId ),
    classes:  [ "item", "earthdawn4e" ],
    actions:  {
      config:             ItemSheetEd._onConfig,
    },
    position: {
      top:    50,
      left:   220,
      width:  520,
    },
  };

  static PARTS = {
    top: {
      template: "systems/ed4e/templates/item/item-partials/item-section-top.hbs",
      id:       "top",
      classes:  [ "top" ]
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
      id:       "-tabs-navigation",
      classes:  [ "tabs-navigation" ],
    },
    "general": {
      template:   "systems/ed4e/templates/item/item-partials/item-description.hbs",
      classes:    [ "general", "scrollable" ],
      scrollable: [ "", ],
    },
    "details": {
      template:   "systems/ed4e/templates/item/item-partials/item-details.hbs",
      classes:    [ "details", "scrollable" ],
      scrollable: [ "" ],
    },
    "effects": {
      template:   "systems/ed4e/templates/item/item-partials/item-details/item-effects.hbs",
      classes:    [ "effects", "scrollable" ],
      scrollable: [ "", ],
    },
  };

  /** @inheritDoc */
  static TABS = {
    sheet: {
      tabs:        [
        { id:    "general", },
        { id:    "details", },
        { id:    "effects", },
      ],
      initial:     "general",
      labelPrefix: "ED.Tabs.ItemSheet",
    },
  };
  // endregion

  // region Properties

  tabGroups = {
    sheet:             "general",
    classAdvancements: "options",
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
        return this._prepareDetailsContext( context, options );
      case "effects":
        break;
    }
    return context;
  }

  /** @inheritDoc */
  async _prepareContext( options ) {
    const context = await super._prepareContext( options );
    foundry.utils.mergeObject(
      context,
      {
        item:                   this.document,
        options:                this.options,
      },
      {
        recursive: false,
      }
    );

    context.enrichedBriefDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.document.system.summary.value,
      {
        // Only show secret blocks to owner
        secrets:    this.document.isOwner,
      }
    );

    return context;
  }

  /**
   * Prepares the context for the "Details" tab.
   *
   * @param {ApplicationRenderContext} context - The context object to be prepared and updated.
   * @param {HandlebarsRenderOptions} options - Options that configure application rendering behavior.
   * @return {Promise<ApplicationRenderContext>} A promise that resolves to the updated context object.
   */
  async _prepareDetailsContext( context, options ) {
    if ( this.document.system.matrix ) await this._prepareMatrixContext( context, options );

    return context;
  }

  /**
   * Prepares the context for the "Matrix" tab.
   *
   * @param {ApplicationRenderContext} context - The context object to be prepared and updated.
   * @param {HandlebarsRenderOptions} options - Options that configure application rendering behavior.
   * @return {Promise<ApplicationRenderContext>} A promise that resolves to the updated context object.
   */
  async _prepareMatrixContext( context, options ) {
    context.activeSpellChoices = this.document.system.getActiveSpellChoices?.();

    const matrixSpellsField = this.document.system.schema.fields.matrix.fields.spells;
    context.matrixSpellsElement = matrixSpellsField.toFormGroup(
      {
        input: foundry.applications.fields.createMultiSelectInput( {
          disabled:    !context.editable,
          name:        matrixSpellsField.fieldPath,
          value:       this.document.system.matrix.spells,
          options:     this.document.system.getMatrixSpellOptions?.() || [],
          sort:        true,
          type:        "multi",
        } ),
      },
      {},
    );
  }

  // endregion

  // region Event Handlers

  /**
   * Opens the configuration application for the item.
   *
   * @type {ApplicationClickAction}
   */
  static async _onConfig( event, target ) {
    event.preventDefault();
    event.stopPropagation();

    let app;
    switch ( target.dataset.configType ) {
      case "extraSuccess":
      case "extraThreads":
        app = new SpellEnhancementsConfig( {
          document: this.document,
          type:     target.dataset.configType,
        } );
        break;
      case "requirements":
      case "restrictions":
        app = new ConstraintsConfig( {
          document: this.document,
          type:     target.dataset.configType,
        } );
        break;
    }
    app?.render( { force: true } );
  }

  /**
   * Helper method to retrieve an embedded document (possibly a grandchild).
   * @param {HTMLElement} element   An element able to find [data-uuid].
   * @returns {foundry.abstract.Document}   The embedded document.
   */
  async _getEmbeddedDocument( element ) {
    return fromUuid(
      element.closest( "[data-uuid]" )?.dataset?.uuid
    );
  }

  // endregion

  // region Drag and Drop

  /**
   * Handle a dropped document on the ItemSheet
   * @param {DragEvent} event         The initiating drop event
   * @param {Document} document       The resolved Document class
   */
  async _onDropDocument( event, document ) {
    // Ignore our handling if dropped on a Foundry document tags element
    if ( event.target.closest(
      foundry.applications.elements.HTMLDocumentTagsElement.tagName.toLowerCase()
    )?.contains( event.target ) ) return;

    if ( !this.item.system._onDropDocument( event, document ) ) return;
    switch ( document.documentName ) {
      case "ActiveEffect":
        return this._onDropActiveEffect( event, /** @type { ActiveEffect } */ document );
      case "Actor":
        return this._onDropActor( event, /** @type { Actor } */ document );
      case "Item":
        return this._onDropItem( event, /** @type { Item } */ document );
      case "Folder":
        return this._onDropFolder( event, /** @type { Folder } */ document );
    }
  }

  /**
   * Handle a dropped Active Effect on the ItemSheet.
   * The default implementation creates an Active Effect embedded document on the Actor.
   * @param {DragEvent} event       The initiating drop event
   * @param {ActiveEffect} effect   The dropped ActiveEffect document
   */
  async _onDropActiveEffect( event, effect ) {
    if ( !this.item.isOwner ) return;
    if ( !effect || ( effect.target === this.item ) ) return;
    const keepId = !this.item.effects.has( effect.id );
    await ActiveEffect.create( effect.toObject(), {parent: this.item, keepId} );
  }

  /**
   * Handle a dropped Actor on the ItemSheet.
   * @param {DragEvent} event     The initiating drop event
   * @param {Actor} actor         The dropped Actor document
   */
  async _onDropActor( event, actor ) {}

  /**
   * Handle a dropped Item on the Actor Sheet.
   * @param {DragEvent} event     The initiating drop event
   * @param {Item} item           The dropped Item document
   */
  async _onDropItem( event, item ) {
    // do nothing
  }

  /**
   * Handle a dropped Folder on the Actor Sheet.
   * @param {DragEvent} event     The initiating drop event
   * @param {object} data         Extracted drag transfer data
   */
  async _onDropFolder( event, data ) {}

  // endregion

}

