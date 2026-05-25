import { getSetting } from "../../helpers/settings.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

const { TextEditor } = foundry.applications.ux;


/**
 * Sheet class mixin to add common functionality shared by all types of document sheets.
 * @param {typeof DocumentSheetV2} Base              The base class.
 * @returns {DocumentSheetEd}   Extended class.
 * @augments {DocumentSheetV2}
 * @mixes HandlebarsApplicationMixin
 */
const DocumentSheetMixinEd = Base => {
  const mixin = foundry.applications.api.HandlebarsApplicationMixin;

  return class DocumentSheetEd extends mixin( Base ) {

    // region Static Properties

    /**
     * Different sheet modes.
     * @enum {number}
     */
    static SHEET_MODES = {
      PLAY: 0,
      EDIT: 1,
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
        createChild:        DocumentSheetEd._onCreateChild,
        deleteChild:        DocumentSheetEd._onDeleteChild,
        displayChild:       DocumentSheetEd._onDisplayChild,
        editChild:          DocumentSheetEd._onEditChild,
        editImage:          DocumentSheetEd._onEditImage,
        toggleActiveEffect: DocumentSheetEd._onToggleActiveEffect,
      },
    };

    // endregion

    // region Properties

    /**
     * The current sheet mode.
     * @type {number}
     */
    _sheetMode = this.constructor.SHEET_MODES.PLAY;

    /**
     * A set of uuids of embedded documents whose descriptions have been expanded on this sheet.
     * @type {Set<string>}
     */
    _expandedItems = new Set();

    // endregion

    // region Getters

    /**
     * Is the sheet currently in 'Edit' mode?
     * @type {boolean}
     */
    get isEditMode() {
      // noinspection JSPotentiallyInvalidUsageOfThis
      return this._sheetMode === this.constructor.SHEET_MODES.EDIT;
    }

    /**
     * Is the sheet currently in 'Play' mode?
     * @type {boolean}
     */
    get isPlayMode() {
      // noinspection JSPotentiallyInvalidUsageOfThis
      return this._sheetMode === this.constructor.SHEET_MODES.PLAY;
    }


    // endregion

    // region Rendering

    /** @inheritdoc */
    async _renderFrame( options = {} ) {
      const frame = await super._renderFrame( options );
      const header = frame.querySelector( ".window-header" );

      // Add edit <-> play slide toggle.
      if ( this.isEditable ) {
        const toggle = document.createElement( "slide-toggle" );
        toggle.checked = this._sheetMode === this.constructor.SHEET_MODES.EDIT;
        toggle.classList.add( "mode-slider" );
        toggle.dataset.tooltip = "ED.Controls.sheetModeEdit";
        toggle.setAttribute( "aria-label", _loc( "ED.Controls.sheetModeEdit" ) );
        toggle.addEventListener( "change", this._onChangeSheetMode.bind( this ) );
        toggle.addEventListener( "dblclick", event => event.stopPropagation() );
        header.insertAdjacentElement( "afterbegin", toggle );
      }

      return frame;
    }

    /** @inheritdoc */
    async _prepareContext( options ) {
      const context = await super._prepareContext( options );
      foundry.utils.mergeObject( context, {
        config:       CONFIG.ED4E,
        ed4eConst:    ED4E_CONSTANTS,
        editable:     this.isEditable && ( this._sheetMode === this.constructor.SHEET_MODES.EDIT ),
        isGM:         game.user.isGM,
        options:      this.options,
        system:       this.document.system,
        systemFields: this.document.system.schema.fields,
      }, {
        recursive: false,
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

    // region Form Handling

    /** @inheritdoc */
    _processFormData( event, form, formData ) {
      const formDataObject = formData.object;

      // Prevent submitting values overridden by effects
      const overrides = foundry.utils.flattenObject( this.document.overrides ) ?? {};
      for ( const key of Object.keys( overrides ) ) delete formDataObject[ key ];
      return foundry.utils.expandObject( formDataObject );
    }

    // endregion

    // region Event Handlers

    /**
     * Resolves an embedded document from UUID or typed document ID on the event target.
     * @param {HTMLElement} target - The HTML element that triggered the event.
     * @returns {Promise<foundry.abstract.Document|null>} - The resolved child document, or null if not found.
     * @protected
     */
    async _resolveChildDocument( target ) {
      const uuid
        = target.dataset.uuid;

      if ( uuid ) {
        const document = await fromUuid( uuid );
        if ( document ) return document;
      }

      const embeddedId = target.dataset.documentId;
      const documentType = target.dataset.documentType;

      if ( !embeddedId ) return null;
      if ( !documentType ) return null;

      if ( documentType === "Item" ) return this.document.items?.get( embeddedId ) ?? null;
      if ( documentType === "ActiveEffect" || documentType === "effect" ) return this.document.effects?.get( embeddedId ) ?? null;
      return null;
    }

    /**
     * Handle the user toggling the sheet mode.
     * @param {Event} event  The triggering event.
     * @protected
     */
    async _onChangeSheetMode( event ) {
      const { SHEET_MODES } = this.constructor;
      const toggle = event.currentTarget;
      const label = _loc( `ED.Controls.sheetMode${toggle.checked ? "Play" : "Edit"}` );
      toggle.dataset.tooltip = label;
      toggle.setAttribute( "aria-label", label );
      this._sheetMode = toggle.checked ? SHEET_MODES.EDIT : SHEET_MODES.PLAY;
      await this.submit();
      this.render();
    }

    /**
     * Creates a new embedded document of the specified type.
     * @param {Event} event - The event that triggered the form submission.
     * @param {HTMLElement} target - The HTML element that triggered the action.
     * @returns {Promise<foundry.abstract.Document>} - A promise that resolves when the child is created.
     * @throws {Error} - If the document type is unknown.
     */
    static async _onCreateChild( event, target ) {
      const documentType = target.dataset.document;
      const documentConfig = CONFIG[documentType];
      const type = target.dataset.type;

      const createData = {
        type,
      };

      switch ( type ) {
        case "effect": {
          return ActiveEffect.implementation.create( {
            type:     SYSTEM_TYPES.ActiveEffect.eae,
            name:     _loc( "ED.ActiveEffect.newEffectName" ),
            icon:     "icons/svg/aura.svg",
            origin:   this.document.uuid,
            duration: {
              value: target.dataset.effectPermanent ? null : 1,
              units: "rounds",
            },
            system:  {
              parentDocumentType: this.document.documentName,
            },
          }, {
            parent:      this.document,
            renderSheet: true,
          } );
        }
        case "spell": {
          const spellcastingType = target.dataset.spellcastingType;
          if ( spellcastingType ) createData[ "system.spellcastingType" ] = spellcastingType;
        }
        default: {
          if ( documentConfig && type in documentConfig.dataModels ) {
            createData.name = _loc( documentConfig.typeLabels[ type ] );
            const createdDocuments = await this.document.createEmbeddedDocuments(
              documentType,
              [ createData ],
            );
            await createdDocuments[0]?.sheet?.render( { force: true } );
            return createdDocuments[0];
          }

          throw new Error( `Unknown document type: ${type}` );
        }
      }

    }

    /**
     * Deletes a child document.
     * @param {Event} event - The event that triggered the form submission.
     * @param {HTMLElement} target - The HTML element that triggered the action.
     * @returns {Promise<foundry.abstract.Document>} - A promise that resolves when the child is deleted.
     */
    static async _onDeleteChild( event, target ) {
      const document = await this._resolveChildDocument( target );
      if ( !document ) return;

      if ( getSetting( "quickDeleteEmbeddedOnShiftClick" ) && event.shiftKey ) return document.delete();

      if ( typeof document.deleteDialog === "function" ) return document.deleteDialog();
      return document.delete();
    }

    /**
     * Displays a child document in the chat
     * @param {Event} event - The event that triggered the form submission.
     * @param {HTMLElement} target - The HTML element that triggered the action.
     * @returns {Promise<foundry.abstract.Document>} - A promise that resolves when the child is displayed in chat.
     */
    static async _onDisplayChild( event, target ) {
      return ChatMessage.create( { content: "Coming up: a beautiful description of the Item you just clicked to be displayed here in chat!" } );
    }

    /**
     * Open a child document's sheet in edit mode.
     * @param {Event} event - The event that triggered the form submission.
     * @param {HTMLElement} target - The HTML element that triggered the action.
     * @returns {Promise<foundry.abstract.Document>} - A promise that resolves when the child is displayed in chat.
     */
    static async _onEditChild( event, target ) {
      const document = await this._resolveChildDocument( target );
      document?.sheet?.render( { force: true } );
    }

    /**
     * Change the document's image.
     * @param {Event} event - The event that triggered the form submission.
     * @param {HTMLElement} target - The HTML element that triggered the action.
     * @returns {Promise<FilePicker>} - A promise that resolves when the image is changed.
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

    /**
     * @type {ApplicationClickAction}
     * @this {DocumentSheetEd}
     */
    static async _onToggleActiveEffect( event, target ) {
      const effect = /** @type {EarthdawnActiveEffect} */await fromUuid( target.dataset.effectUuid );

      await effect.toggleActive();
    }

    // endregion

  };

};

export default DocumentSheetMixinEd;