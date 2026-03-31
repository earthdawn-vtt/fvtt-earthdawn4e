/**
 * Base class for all Earthdawn migration classes.
 * Provides a common interface for migration logic.
 */
export default class BaseMigration {
  /**
   * Migrate data from earthdawn4e legacy to ed4e.
   * @param {object} source - The source document data.
   * @abstract
   */
  static migrateEarthdawnData( source ) {
    throw new Error( "migrateEarthdawnData must be implemented by subclass" );
  }
}

/**
 * Determine the new target value of an item setting based on its name referenced in a config.
 * @param {string} slugifiedName The name of the item.
 * @param {object} configMappings The mapping of names to the target value.
 * @returns {string|null} The target value for that item or `null` if no mapping was found.
 */
export function determineConfigValue( slugifiedName, configMappings ) {
  for ( const { names, targetValue } of configMappings ) {
    if ( names.some( itemName => slugifiedName.includes( itemName.slugify( { lowercase: true, strict: true } ) ) ) ) {
      return targetValue;
    }
  }
  return null;
}