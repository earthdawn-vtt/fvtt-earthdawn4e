import SystemDataModel from "../abstract/system-data-model.mjs";

/**
 * A mixin class that manages typed entries in a data model.
 * This mixin provides methods for adding, removing, and managing entries
 * defined by specific types and fields within a collection-like structure.
 * @see {@link TypedSchemaField}
 * @mixin
 */
export default class TypedEntryManagerMixin extends SystemDataModel {

  // region Static Properties

  static ENTRY_DATA_CLASS;

  static FIELD_NAMES = [];

  // endregion

  // region Methods

  /**
   * Adds an entry to this data model.
   * @param {keyof ENTRY_DATA_CLASS.TYPES} entryType The type of entry to add.
   * @param {FIELD_NAMES} fieldName The field to add the constraint to.
   * @returns {Promise<ClientDocument|undefined>} Returns the updated document or undefined if not updated.
   */
  async addTypedEntry( entryType, fieldName ) {
    if ( !this.constructor.FIELD_NAMES.includes( fieldName ) )
      throw new Error( `Invalid field name for entry of type ${ this.constructor.ENTRY_DATA_CLASS }. Must be one of ${ this.constructor.FIELD_NAMES }.` );

    const entryData = this.constructor.ENTRY_DATA_CLASS.fromType( entryType );

    const fieldPath = this._getFieldPathToAddTypedEntry( fieldName, entryType );

    return await this.parentDocument.update( {
      [ fieldPath ]: _replace( entryData ),
    } );
  }

  /**
   * Gets the field path in a TypedObjectField for adding an entry. Each subclass must implement this method.
   * @param {string} fieldName The field to add the constraint to as defined in {@link FIELD_NAMES}.
   * @param {keyof ENTRY_DATA_CLASS.TYPES} entryType The type of entry to add.
   * @returns {string} The field path for adding the entry.
   * @abstract
   */
  _getFieldPathToAddTypedEntry( fieldName, entryType ) {
    throw new Error( "This method must be implemented by subclasses." );
  }

  /**
   * Returns the key used to store an entry in a collection field.
   *
   * The key is unique within the {@link TypedObjectField} and is derived
   * from the entry type.
   * @param {FIELD_NAMES} fieldName The name of the field to store the enhancement in.
   * @param {keyof MetricData.TYPES} entryType The enhancement type to derive the key from.
   * @returns {string} The unique storage key for the entry in the data model's `TypedObjectField`.
   */
  _getNewEntryKey( fieldName, entryType ) {
    const existingKeys = Object.keys( this[fieldName] || {} );
    let key = `${ entryType }1`;
    let index = 2;

    while ( existingKeys.includes( key ) ) {
      key = `${ entryType }${ index }`;
      index++;
    }

    return key;
  }

  /**
   * Removes a entry from this knack. Sets the entire field to null if there are no more entries.
   * @param {keyof ENTRY_DATA_CLASS.TYPES} entryType The type of entry to remove.
   * @param {FIELD_NAMES} fieldName The field to remove the entry from.
   * @param {string|undefined} [storageKey] The key to remove from the collection field.
   * If not provided, the key is derived from the entry type.
   * @returns {Promise<ClientDocument|undefined>} Returns the updated knack item or undefined if not updated.
   */
  async removeTypedEntry( entryType, fieldName, storageKey ) {
    if ( !this.constructor.FIELD_NAMES.includes( fieldName ) )
      throw new Error( `Invalid field name for entry of type ${ this.constructor.ENTRY_DATA_CLASS }. Must be one of ${ this.constructor.FIELD_NAMES }.` );

    const fieldPath = this._getFieldPathToRemoveTypedEntry( fieldName, entryType, storageKey );

    return await this.parentDocument.update( {
      [ fieldPath ]: _del,
    } );
  }

  /**
   * Gets the field path in a TypedObjectField for removing an entry.
   * @param {FIELD_NAMES} fieldName The name of the field to remove the entry from.
   * @param {keyof ENTRY_DATA_CLASS.TYPES} constraintType The type of entry to remove.
   * @param {string} storageKey The key to remove from the collection field.
   * @returns {string} The field path for removing the entry.
   */
  _getFieldPathToRemoveTypedEntry( fieldName, constraintType, storageKey ) {
    const constraintKeys = Object.keys( this[fieldName] || {} );

    return constraintKeys.includes( storageKey ) && constraintKeys.length === 1
      ? `system.${ fieldName }`
      : `system.${ fieldName }.${ storageKey }`;
  }

  // endregion

}