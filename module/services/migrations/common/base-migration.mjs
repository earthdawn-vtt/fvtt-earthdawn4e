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
