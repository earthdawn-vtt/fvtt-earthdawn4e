import SpellEnhancementsConfig from "../configs/spell-enhancements-config.mjs";
import ConstraintsConfig from "../configs/constraints-config.mjs";
import DocumentSheetMixinEd from "../api/document-sheet-mixin.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { TextEditor } = foundry.applications.ux;
const { HTMLDocumentTagsElement }= foundry.applications.elements;


// noinspection JSClosureCompilerSyntax
/**
 * Extend the basic ActorSheet with modifications
 * @augments {ItemSheetV2}
 * @mixes DocumentSheetMixinEd
 */
export default class ItemSheetEd extends DocumentSheetMixinEd( ItemSheetV2 ) {

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
    dragDrop: [
      {
        dragSelector: ".draggable",
        dropSelector: null,
      },
      {
        dragSelector: "[data-drag]",
        dropSelector: null,
      },
    ],
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

  /**
   * The drag-and-drop handlers for this Application.
   * @type {DragDrop[]}
   */
  #dragDrop;

  // endregion

  /** @inheritdoc */
  constructor( options = {} ) {
    super( options );

    this.#dragDrop = this.#createDragDropHandlers();
  }

  // region Getters

  /**
   * The drag-and-drop handlers for this Application.
   * @type {DragDrop[]}
   */
  get dragDrop() {
    return this.#dragDrop;
  }

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
        return this._prepareDetailsContext( context, options );
      case "effects":
        break;
    }
    return context;
  }

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

    context.enrichedBriefDescription = await TextEditor.enrichHTML(
      this.document.system.summary.value,
      {
        // Only show secret blocks to owner
        secrets:    this.document.isOwner,
      }
    );

    return context;
  }

  async _prepareDetailsContext( context, options ) {
    if ( this.document.system.matrix )await this._prepareMatrixContext( context, options );

    return context;
  }

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

  /** @inheritDoc */
  async _onRender( context, options ) {
    await super._onRender( context, options );

    this.#dragDrop.forEach( dragDropConfig => dragDropConfig.bind( this.element ) );
  }
  
  // endregion

  // region Event Handlers

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

  #createDragDropHandlers() {
    return this.options.dragDrop.map( dragDropConfig => {
      dragDropConfig.permissions = {
        dragstart: this._canDragStart.bind( this ),
        drop:      this._canDragDrop.bind( this ),
      };
      dragDropConfig.callbacks = {
        dragstart: this._onDragStart.bind( this ),
        dragover:  this._onDragOver.bind( this ),
        drop:      this._onDrop.bind( this ),
      };
      return new foundry.applications.ux.DragDrop( dragDropConfig );
    } );
  }

  // this is taken and adjusted from Foundry's ActorSheetV2 class

  /**
   * Define whether a user is able to begin a dragstart workflow for a given drag selector.
   * @param {string} selector   The candidate HTML selector for dragging.
   * @returns {boolean}         Can the current user drag this selector?
   */
  _canDragStart( selector ) {
    return true;
  }

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector.
   * @param {string} selector   The candidate HTML selector for the drop target.
   * @returns {boolean}         Can the current user drop on this selector?
   */
  _canDragDrop( selector ) {
    return this.isEditable;
  }

  /**
   * An event that occurs when a drag workflow begins for a draggable item on the sheet.
   * @param {DragEvent} event       The initiating drag start event
   * @returns {Promise<void>}
   * @protected
   */
  async _onDragStart( event ) {
    if ( "link" in event.target.dataset ) return;

    const currentTarget = event.currentTarget;
    let dragData;

    // Active Effect
    if ( currentTarget.dataset.effectId ) {
      const effect = this.item.effects.get( currentTarget.dataset.effectId );
      dragData = effect.toDragData();
    } else {
      // Documents
      const document = await this._getEmbeddedDocument( currentTarget );
      dragData = document?.toDragData?.();
    }

    // Set data transfer
    if ( !dragData ) return;
    event.dataTransfer.setData( "text/plain", JSON.stringify( dragData ) );
  }

  /**
   * An event that occurs when a drag workflow moves over a drop target.
   * @param {DragEvent} event      The dragover event
   * @protected
   */
  _onDragOver( event ) {}

  /**
   * An event that occurs when data is dropped into a drop target.
   * @param {DragEvent} event     The drop event
   * @returns {Promise<void>}
   * @protected
   */
  async _onDrop( event ) {
    if ( !this.isEditable ) return;
    const data = TextEditor.getDragEventData( event );
    const item = this.item;
    const allowed = Hooks.call( "dropItemSheetData", item, this, data );
    if ( allowed === false ) return;

    // Dropped Documents
    const documentClass = getDocumentClass( data.type );
    if ( documentClass ) {
      const document = await documentClass.fromDropData( data );
      await this._onDropDocument( event, document );
    }
  }

  /**
   * Handle a dropped document on the ItemSheet
   * @param {DragEvent} event         The initiating drop event
   * @param {Document} document       The resolved Document class
   * @returns {Promise<void>}
   * @protected
   */
  async _onDropDocument( event, document ) {
    // Ignore our handling if dropped on a Foundry document tags element
    if ( event.target.closest(
      HTMLDocumentTagsElement.tagName.toLowerCase()
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
   * @returns {Promise<void>}
   * @protected
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
   * @returns {Promise<void>}
   * @protected
   */
  async _onDropActor( event, actor ) {}

  /**
   * Handle a dropped Item on the Actor Sheet.
   * @param {DragEvent} event     The initiating drop event
   * @param {Item} item           The dropped Item document
   * @returns {Promise<void>}
   * @protected
   */
  async _onDropItem( event, item ) {
    // do nothing
  }

  /**
   * Handle a dropped Folder on the Actor Sheet.
   * @param {DragEvent} event     The initiating drop event
   * @param {object} data         Extracted drag transfer data
   * @returns {Promise<void>}
   * @protected
   */
  async _onDropFolder( event, data ) {}

  // endregion

}

