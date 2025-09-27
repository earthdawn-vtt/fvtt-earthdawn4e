import DialogEd from "../../../applications/api/dialog.mjs";
import { SYSTEM } from "../../../config/_module.mjs";

export default class EdImporter {

  // region Static Properties

  /**
   * The type of import to perform. Determines the used subclass.
   * @type {string}
   */
  static IMPORT_TYPE = "";

  // endregion

  // region Static Methods

  /**
   * Create an importer instance from a file selection dialog.
   * @param {object} options              The options to create the importer from.
   * @param {string} [options.importType] The type of import to perform, one of Foundry's document types, or "directory".
   * @returns {Promise<EdImporter>} The created importer instance.
   */
  static async fromFileSelectDialog( options = {} ) {
    return DialogEd.wait( {
      window:  {
        title:   game.i18n.localize( "DOCUMENT.ImportData" ),
      },
      content: await foundry.applications.handlebars.renderTemplate(
        "templates/apps/import-data.hbs",
        {
          hint1: game.i18n.localize( "ED.Dialogs.ImportDocument.importDataHint1" ),
          hint2: game.i18n.localize( "ED.Dialogs.ImportDocument.importDataHint2" ),
        },
      ),
      buttons: [ {
        action:   "import",
        label:    game.i18n.localize( "ED.Dialogs.Buttons.import" ),
        icon:     `fa-solid ${ SYSTEM.icons.import }`,
        default:  true,
        callback: ( event, button ) => {
          const form = button.form;
          if ( !form.data.files.length ) {
            return ui.notifications.error( "DOCUMENT.ImportDataError", {localize: true} );
          }
          return new this( form.data.files[0], options );
        },
      }, {
        action: "no",
        label:  game.i18n.localize( "ED.Dialogs.Buttons.cancel" ),
        icon:   `fa-solid ${ SYSTEM.icons.cancel }`,
      } ],
    } );
  }

  /**
   * @typedef {object} ImportOptions
   * @property {boolean} [overwrite=false]    Whether to overwrite existing documents.
   * @property {boolean} [logToJournal=false] Whether to log the import process to a new Foundry journal document.
   */

  /**
   * Import data from the given path into the current world.
   * @param {string} path    The path to import from.
   * @param {ImportOptions} options Import options.
   * @param {string} options.documentType The type of document to import, one of Foundry's {@link CONST.PRIMARY_DOCUMENT_TYPES}.
   * @param {object} options.documentData The data the new document should be created with.
   * @returns {Promise<void>}
   */
  static async import( path, options ) {
    const documentType = options.documentType?.toLowerCase().capitalize();
    try {
      return CONFIG[options.documentType].documentClass.create( options.documentData, { renderSheet: true } );
    } catch ( error ) {
      console.error( `Failed to create document of type ${ documentType } from path ${ path }:`, error );
      throw error;
    }
  }

  // endregion
   
  // region Properties

  /**
   * Any kind of data that should be imported. This is subclass-specific, e.g. an object with document data from an
   * export Actor JSON file.
   * @type {*}
   */
  _data;

  /**
   * The type of document to import, one of Foundry's document types. See {@link CONST.WORLD_DOCUMENT_TYPES}.
   * @type {string}
   */
  _documentType;

  /**
   * The file to import from.
   * @type {File}
   */
  _file;

  // endregion

  /**
   * Create a new importer instance.
   * @param {File} file           The file to import from.
   * @param {object} options      Additional options for the importer.
   * @param {string} [options.documentType]  The type of document to import, one of Foundry's {@link CONST.PRIMARY_DOCUMENT_TYPES}.
   * @param {*} [options.data]    Any kind of data that should be imported. This is subclass-specific, e.g. an object with document data from an
   *                              export Actor JSON file.
   */
  constructor( file, options ) {
    this._file = file;
    const { data, documentType } = options;
    this._data = data;
    this._documentType = documentType?.toLowerCase().capitalize();
  }

  // region Methods

  async import() {
    if ( !this._data )await this._readDataFromPath();
    if ( !this._documentType )this._determineDocumentType();
    return this.constructor.import(
      this._file,
      {
        documentType: this._documentType,
        documentData: this._data,
      }
    );
  }

  _determineDocumentType() {
    let documentType = foundry.utils.parseUuid(
      this._data?._stats?.exportSource?.uuid
    )?.type;

    if ( typeof documentType !== "string" || !CONST.WORLD_DOCUMENT_TYPES.includes( documentType ) ) {
      throw new Error( `Invalid or missing document type: ${ documentType }` );
    }
    this._documentType = documentType;
  }

  /**
   * Read data from the given path and store it as `_data`.
   * Assumes that `_path` is a valid text file.
   * @returns {Promise<void>}
   */
  async _readDataFromPath() {
    try {
      this._data = await foundry.utils.readTextFromFile( this._file );
      this._data = JSON.parse( this._data );
    } catch ( error ) {
      console.error( `Failed to parse JSON from file at path ${ this._file }:`, error );
      throw error;
    }
    /* for ( const [ key, value ] of Object.entries( this._data ) ) {
      if ( foundry.utils.isEmpty( value ) ) delete this._data[key];
    }
    if ( this._data._steps ) delete this._data._steps; */
  }

  // endregion

}