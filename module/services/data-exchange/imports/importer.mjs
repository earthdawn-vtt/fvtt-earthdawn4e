import { determineDocumentType } from "./_module.mjs";
import ImportDataApp from "../../../applications/data-exchange/import-data.mjs";
import ImportMigration from "../../migrations/import-migration.mjs";

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
    return ImportDataApp.waitPrompt( { importerOptions: options } );
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
   * @param {object[]} options.documentData The data the new document should be created with.
   * @returns {Promise<Document>} The created document.
   */
  static async import( path, options ) {
    const documentType = options.documentType?.toLowerCase().capitalize();
    try {
      let createData = options.documentData;
      if ( options.documentData[0]._stats?.exportSource?.systemVersion === "0.8.2.2" ) {
        const migration = new ImportMigration( createData, { documentType: options.documentType} );
        createData = await migration.migrate();
      }

      return CONFIG[options.documentType].documentClass.create( createData, { renderSheet: true } );
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
   * @type {*[]}
   */
  _data;

  /**
   * The type of document to import, one of Foundry's document types. See {@link CONST.WORLD_DOCUMENT_TYPES}.
   * @type {string}
   */
  _documentType;

  /**
   * The files to import from.
   * @type {File[]}
   */
  _files;

  // endregion

  /**
   * Create a new importer instance.
   * @param {File[]} files           The files to import from. The must all have the same `documentType`.
   * @param {object} options      Additional options for the importer.
   * @param {string} [options.documentType]  The type of document to import, one of Foundry's {@link CONST.PRIMARY_DOCUMENT_TYPES}.
   * @param {*[]} [options.data]    Any kind of data that should be imported. This is subclass-specific, e.g. an object with document data from an
   *                              export Actor JSON file.
   */
  constructor( files, options ) {
    this._files = files;
    const { data, documentType } = options;
    this._data = data;
    this._documentType = documentType?.toLowerCase().capitalize();
  }

  // region Methods

  /**
   * Import the data from the file into the current world.
   * @returns {Promise<Document>} The created document.
   */
  async import() {
    if ( !this._data )await this._readDataFromPath();
    if ( !this._documentType )this._determineDocumentType();
    return this.constructor.import(
      this._files,
      {
        documentType: this._documentType,
        documentData: this._data,
      }
    );
  }

  /**
   * Determine the document type from the data read from the file and store it as `_documentType`.
   * @throws {Error} If the document type is invalid or missing.
   */
  _determineDocumentType() {
    this._documentType = determineDocumentType( this._data[0] );
  }

  /**
   * Read data from the given path and store it as `_data`.
   * Assumes that `_path` is a valid text file.
   * @returns {Promise<void>}
   */
  async _readDataFromPath() {
    try {
      this._data = await Promise.all(
        Array.from( this._files ).map(
          file => foundry.utils.readTextFromFile( file )
        )
      );
      this._data = this._data.map( data => JSON.parse( data ) );
    } catch ( error ) {
      console.error( `Failed to parse JSON from file at path ${ this._files }:`, error );
      throw error;
    }
  }

  // endregion

}