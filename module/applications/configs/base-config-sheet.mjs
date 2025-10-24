import ED4E from "../../config/_module.mjs";
import DocumentSheetMixinEd from "../api/document-sheet-mixin.mjs";

const { DocumentSheetV2, } = foundry.applications.api;

/**
 * Base document sheet on which all document configuration sheets should be based.
 */
export default class BaseConfigSheet extends DocumentSheetMixinEd( DocumentSheetV2 ) {

  // region Static Properties

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes:     [ "config-sheet", ],
    sheetConfig: false,
    dragDrop:    [
      {
        dragSelector: "[data-drag]",
        dropSelector: null,
      },
    ],
  };

  // endregion

  // region Properties

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

  async _renderFrame( options = {} ) {
    // Overwrite to not add the edit toggle (this shouldn't be a DocumentSheet I guess...)
    return super._renderFrame( options );
  }

  /** @inheritDoc */
  async _onRender( context, options ) {
    await super._onRender( context, options );

    this.#dragDrop.forEach( dragDropConfig => dragDropConfig.bind( this.element ) );
  }

  /** @inheritDoc */
  async _preparePartContext( partId, context, options ) {
    const newContext = await super._preparePartContext( partId, context, options );

    if ( this.document ) {
      newContext.document = this.document;
      newContext.system = this.document.system;
      newContext.options = this.options;
      newContext.systemFields = this.document.system.schema.fields;
      newContext.config = ED4E;
    }

    return newContext;
  }

  // endregion

  // region Drag and Drop

  /**
   * Create drag-and-drop workflow handlers for this Application based on the configured options.
   * @returns {DragDrop[]} An array of DragDrop handlers
   */
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
  };

  /**
   * Define whether a user is able to begin a dragstart workflow for a given drag selector
   * @param {string} selector       The candidate HTML selector for dragging
   * @returns {boolean}             Can the current user drag this selector?
   * @protected
   */
  _canDragStart( selector ) {
    return this.isEditable;
  }


  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
   * @param {string} selector       The candidate HTML selector for the drop target
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop( selector ) {
    return this.isEditable;
  }


  /**
   * Callback actions which occur at the beginning of a drag start workflow.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragStart( event ) {
    if ( "link" in event.target.dataset ) return;

    // Extract the data you need
    let dragData = event.target.dataset.drag;

    if ( !dragData ) return;

    // Set data transfer
    event.dataTransfer.setData( "text/plain", JSON.stringify( dragData ) );
  }


  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragOver( event ) {}


  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  async _onDrop( event ) {
    /* const data = TextEditor.getDragEventData( event );

    // Handle different data types
    switch ( data.type ) {
      // write your cases
    } */
  }

  // endregion

}