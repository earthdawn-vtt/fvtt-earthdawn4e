/**
 * Migration handler for reputation items from earthdawn4e legacy system
 * Reputation items need to be converted from Items to group Actors
 */
import BaseMigration from "../../../common/base-migration.mjs";

export default class ReputationMigration extends BaseMigration {
  /**
   * Migrate reputation item data to group actor format
   * Note: This handles the data structure transformation, but the actual
   * Item→Actor document conversion needs to be handled at a higher level
   * @param {object} source - The source reputation item document
   * @returns {object} - The migrated data (still as Item structure)
   */
  static async migrateEarthdawnData( source ) {
    if ( game.settings.get( "ed4e", "debug" ) === true ) {
      console.log( `ED Migration | Processing reputation item "${source.name || "Unnamed"}"` );
    }

    // TODO: Implement reputation item to group actor data transformation
    // This should prepare the data structure for eventual conversion to Actor
    
    // For now, mark it for post-processing
    if ( !source.system.migrationNotes ) {
      source.system.migrationNotes = [];
    }
    source.system.migrationNotes.push( "REQUIRES_ITEM_TO_ACTOR_CONVERSION:group" );
    
    if ( game.settings.get( "ed4e", "debug" ) === true ) {
      console.warn( `ED Migration | Reputation item "${source.name}" marked for Item→Actor conversion - this requires special handling` );
    }
    
    return source;
  }
}
