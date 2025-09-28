import { determineDocumentType } from "../data-exchange/imports/_module.mjs";
import { typeMigrationRegistry } from "./v082/document-type-migrations/_module.mjs";

export default class ImportMigration {

  /**
   * @typedef {object} ImportMigrationOptions
   * @property {string} [documentType] The type of document to import, one of
   * Foundry's {@link CONST.PRIMARY_DOCUMENT_TYPES}.
   */

  // region Properties

  /**
   * The data read from the imported JSON files.
   * @type {object[]}
   */
  _data;

  /**
   * The type of document to import, one of Foundry's document types. See
   * {@link CONST.WORLD_DOCUMENT_TYPES}.
   * @type {string}
   */
  _documentType;

  /**
   * The subtype of the document to import, e.g. "talent" for items.
   * @type {string}
   */
  _documentSubtype;

  // endregion

  /**
   * @param {object|object[]} data The data read from the imported JSON files. Had to be
   * exported from Earthdawn 4e system version 0.8.2.
   * @param {object} options Additional options for the importer.
   */
  constructor( data, options = {} ) {
    this._data = Array.isArray( data ) ? data : [ data ];

    const { documentType } = options;
    this._documentType = documentType?.toLowerCase().capitalize()
      || determineDocumentType( data );
    this._documentSubtype = data.type?.toLowerCase();
  }

  // region Methods

  /**
   * Add more data to be migrated.
   * @param {object|object[]} moreData More data to be migrated.
   */
  addData( moreData ) {
    if ( Array.isArray( moreData ) ) {
      this._data.push( ...moreData );
    } else {
      this._data.push( moreData );
    }
  }



  /**
   * Migrate the provided data.
   * @returns {Promise<object[]>} The migrated data, ready to be imported into
   * the current world.
   * @throws {Error} If no migration class is found for the document type and
   * subtype.
   */
  async migrate() {
    /** @type {typeof BaseMigration} */ const MigrationClass = typeMigrationRegistry[
      this._documentType.toLowerCase()
    ][
      this._documentSubtype
    ];
    if ( !MigrationClass ) {
      throw new Error(
        `No migration class found for document type ${ this._documentType } and subtype ${ this._documentSubtype }`
      );
    }

    return Promise.all(
      this._data.map(
        source => MigrationClass.migrateEarthdawnData( source )
      )
    );
  }

  // endregion

}