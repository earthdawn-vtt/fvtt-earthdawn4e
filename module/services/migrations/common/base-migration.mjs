/**
 * Base class for all Earthdawn migration classes.
 * Provides a common interface for migration logic.
 */
export default class BaseMigration {
  /**
   * Collection to track successful migrations
   * @type {Array}
   */
  static successfulMigrations = [];

  /**
   * Collection to track incomplete migrations
   * @type {Array}
   */
  static incompleteMigrations = [];

  /**
   * Add a document to the successful migrations collection
   * @param {object} document - The migrated document
   */
  static addSuccessfulMigration( document ) {
    this.successfulMigrations.push( {
      name:      document.name,
      uuid:      document.uuid,
      type:      document.type,
      timestamp: new Date().toISOString()
    } );
  }

  /**
   * Add a document to the incomplete migrations collection
   * @param {object} document - The partially migrated document
   * @param {string} reason - The reason for incomplete migration
   */
  static addIncompleteMigration( document, reason ) {
    this.incompleteMigrations.push( {
      name:      document.name,
      uuid:      document.uuid,
      type:      document.type,
      reason:    reason,
      timestamp: new Date().toISOString()
    } );
  }

  /**
   * Get all successful migrations
   * @returns {Array} Array of successful migrations
   */
  static getSuccessfulMigrations() {
    return this.successfulMigrations;
  }

  /**
   * Get all incomplete migrations
   * @returns {Array} Array of incomplete migrations
   */
  static getIncompleteMigrations() {
    return this.incompleteMigrations;
  }

  /**
   * Migrate data from earthdawn4e legacy to ed4e.
   * @param {object} source - The source document data.
   * @abstract
   */
  static migrateEarthdawnData( source ) {
    throw new Error( "migrateEarthdawnData must be implemented by subclass" );
  }
}