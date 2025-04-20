import { getSetting } from "../../settings.mjs";

const { TextEditor } = foundry.applications.ux;


/**
 * Sheet class mixin to add common functionality shared by all types of document sheets.
 * @param {*} Base              The base class.
 * @returns {DocumentSheetEd}   Extended class.
 * @mixin
 */
const DocumentSheetMixinEd = Base => {
  const mixin = foundry.applications.api.HandlebarsApplicationMixin;
  return class DocumentSheetEd extends mixin( Base ) {

    /**
     * Different sheet modes.
     * @enum {number}
     */
    static SHEET_MODES = {
      EDIT: 0,
      PLAY: 1,
    };

    /** @inheritdoc */
    static DEFAULT_OPTIONS = {
      classes: [ "ed4e", "sheet", ],
      form:    {
        submitOnChange: true,
      },
      tag:    "form",
      window: {
        contentClasses: [ "standard-form" ],
        frame:          true,
        icon:           false,
        minimizable:    true,
        positioned:     true,
        resizable:      true,
      },
      actions: {
        createChild:  DocumentSheetEd._onCreateChild,
        deleteChild:  DocumentSheetEd._onDeleteChild,
        displayChild: DocumentSheetEd._onDisplayChild,
        editChild:    DocumentSheetEd._onEditChild,
        editImage:    DocumentSheetEd._onEditImage,
      },
    };

    // region Properties

    /**
     * The current sheet mode.
     * @type {number}
     */
    _sheetMode = this.constructor.SHEET_MODES.PLAY;

    /**
     * Is the sheet currently in 'Play' mode?
     * @type {boolean}
     */
    get isPlayMode() {
      // noinspection JSPotentiallyInvalidUsageOfThis
      return this._sheetMode === this.constructor.SHEET_MODES.PLAY;
    }

    /**
     * Is the sheet currently in 'Edit' mode?
     * @type {boolean}
     */
    get isEditMode() {
      // noinspection JSPotentiallyInvalidUsageOfThis
      return this._sheetMode === this.constructor.SHEET_MODES.EDIT;
    }

    /**
     * A set of uuids of embedded documents whose descriptions have been expanded on this sheet.
     * @type {Set<string>}
     */
    _expandedItems = new Set();

    // endregion

    // region Rendering

    /** @inheritdoc */
    async _prepareContext( options ) {
      const context = await super._prepareContext( options );
      foundry.utils.mergeObject( context, {
        config:       CONFIG.ED4E,
        isGM:         game.user.isGM,
        options:      this.options,
        system:       this.document.system,
        systemFields: this.document.system.schema.fields,
      } );

      context.enrichedDescription = await TextEditor.enrichHTML(
        this.document.system.description.value,
        {
          // only show secret blocks to owner
          secrets:    this.document.isOwner,
          EdRollData: this.document.getRollData
        }
      );

      return context;
    }

    // endregion

    // region Event Handlers

    /**
     * Creates a new embedded document of the specified type.
     * @param {Event} event - The event that triggered the form submission.
     * @param {HTMLElement} target - The HTML element that triggered the action.
     * @returns {Promise<foundry.abstract.Document>} - A promise that resolves when the child is created.
     * @throws {Error} - If the document type is unknown.
     * @userFunction UF_DocumentSheetMixinEd-onCreateChild
     */
    static async _onCreateChild( event, target ) {
      const type = target.dataset.type;

      switch ( type ) {
        case "effect": {
          return ActiveEffect.implementation.create( {
            type:     "eae",
            name:     game.i18n.localize( "ED.ActiveEffect.newEffectName" ),
            icon:     "icons/svg/aura.svg",
            changes:  [ {} ],
            system:  {
              duration: {
                type: target.dataset.effectPermanent ? "permanent" : "combat",
              },
              changes: [ {} ],
            },
          }, {
            parent:      this.document,
            renderSheet: true,
          } );
        }
        default: {
          throw new Error( `Unknown document type: ${type}` );
        }
      }

    }

    /**
     * Deletes a child document.
     * @param {Event} event - The event that triggered the form submission.
     * @param {HTMLElement} target - The HTML element that triggered the action.
     * @returns {Promise<foundry.abstract.Document>} - A promise that resolves when the child is deleted.
     * @userFunction UF_DocumentSheetMixinEd-onDeleteChild
     */
    static async _onDeleteChild( event, target ) {
      const document = await fromUuid( target.dataset.uuid );
      if ( getSetting( "quickDeleteEmbeddedOnShiftClick" ) && event.shiftKey ) return document.delete();
      else document.deleteDialog();
    }

    /**
     * Displays a child document in the chat
     * @param {Event} event - The event that triggered the form submission.
     * @param {HTMLElement} target - The HTML element that triggered the action.
     * @returns {Promise<foundry.abstract.Document>} - A promise that resolves when the child is displayed in chat.
     * @userFunction UF_DocumentSheetMixinEd-onDisplayChild
     */
    static async _onDisplayChild( event, target ) {
      return ChatMessage.create( { content: "Coming up: a beautiful description of the Item you just clicked to be displayed here in chat!" } );
    }

    /**
     * Open a child document's sheet in edit mode.
     * @param {Event} event - The event that triggered the form submission.
     * @param {HTMLElement} target - The HTML element that triggered the action.
     * @returns {Promise<foundry.abstract.Document>} - A promise that resolves when the child is displayed in chat.
     * @userFunction UF_DocumentSheetMixinEd-onEditChild
     */
    static async _onEditChild( event, target ) {
      ( await fromUuid( target.dataset.uuid ) ).sheet?.render( { force: true } );
    }

    /**
     * Change the document's image.
     * @param {Event} event - The event that triggered the form submission.
     * @param {HTMLElement} target - The HTML element that triggered the action.
     * @returns {Promise<FilePicker>} - A promise that resolves when the image is changed.
     * @userFunction UF_DocumentSheetMixinEd-onEditImage
     */
    static async _onEditImage( event, target ) {
      const attr = target.dataset.edit;
      const current = foundry.utils.getProperty( this.document, attr );
      const { img } = this.document.constructor.getDefaultArtwork?.( this.document.toObject() ) ?? {};
      const fp = new foundry.applications.apps.FilePicker( {
        current,
        type:           "image",
        redirectToRoot: img ? [ img ] : [],
        callback:       ( path ) => {
          this.document.update( { [attr]: path } );
        },
        top:  this.position.top + 40,
        left: this.position.left + 10,
      } );
      return fp.browse();
    }

    // endregion

  };

};

export default DocumentSheetMixinEd;