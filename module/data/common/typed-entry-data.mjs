import SparseDataModel from "../abstract/sparse-data-model.mjs";

/**
 * @template T
 * @typedef {Record<string, T>} TypedEntryTypes
 */

/**
 * Represents a typed entry data model which is used in {@link TypedSchemaField}s.
 * @abstract
 * @augments {SparseDataModel}
 * @template {typeof TypedEntryData} T
 */
export default class TypedEntryData extends SparseDataModel {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
      type: new foundry.data.fields.StringField( {
        required:        true,
        blank:           false,
        initial:         this.TYPE,
        validate:        value => value === this.TYPE,
        validationError: `must be equal to "${ this.TYPE }"`,
      } ),
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.General.TypedEntry",
  ];

  /** @type {TypedEntryTypes<T>} */
  static get TYPES() {
    throw new Error( "A TypedEntryData subclass must implement this getter" );
  }

  /** @type {string} */
  static TYPE = "";

  // endregion

  // region Static Methods

  /**
   * Create a new instance of a typed entry class based on the given type.
   * @param {string} type - The type of entry to create.
   * @param {object} [data] - The data to initialize the entry with.
   * @returns {ConstraintData} - A new instance of the typed entry class.
   * @throws {Error} - If no typed entry class is found for the given type.
   */
  static fromType( type, data = {} ) {
    const TypedEntryClass = this.TYPES[ type ];
    if ( !TypedEntryClass )
      throw new Error( `No TypedEntry class found for type "${ type }"` );
    return new TypedEntryClass( data );
  }

  // endregion

  // region Getters

  /**
   * A summary string representing this entry.
   * @type {string}
   * @abstract
   */
  get summaryString() {
    throw new Error( "A TypedEntryData subclass must implement this getter" );
  }

  // endregion

}