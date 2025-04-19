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
      classes: [ "ed4e" ],
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
      actions: {},
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
      return this._sheetMode === this.constructor.SHEET_MODES.PLAY;
    }

    /**
     * Is the sheet currently in 'Edit' mode?
     * @type {boolean}
     */
    get isEditMode() {
      return this._sheetMode === this.constructor.SHEET_MODES.EDIT;
    }

    /**
     * A set of uuids of embedded documents whose descriptions have been expanded on this sheet.
     * @type {Set<string>}
     */
    _expandedItems = new Set();

    // endregion
  };

};

export default DocumentSheetMixinEd;