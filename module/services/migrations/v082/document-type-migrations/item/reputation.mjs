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

    try {
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

      // region Migration completeness check

      // Check for specific values that would cause a talent to be marked incomplete
      const hasIncompleteAttributes =  await this.checkForIncompleteValues( source );

      // If the talent has attributes that make it incomplete, add it to incomplete migrations
      if ( hasIncompleteAttributes.hasIssues ) {
        const migrationData = {
          name:      source.name || "Unknown Talent",
          uuid:      `Item.${source._id}`,
          type:      source.type,
          id:        source._id
        };
        this.addIncompleteMigration( migrationData, hasIncompleteAttributes.reason );
      
      // Continue with migration anyway to do as much as possible
      }

      // If we haven't already marked this as incomplete due to attributes,
      // mark it as successfully migrated
      if ( !hasIncompleteAttributes.hasIssues ) {
        // Migration was successful - add to successful migrations
        const migrationData = {
          name:      source.name || "Unknown Talent",
          uuid:      `Item.${source._id}`,
          type:      source.type,
          id:        source._id
        };
        this.addSuccessfulMigration( migrationData );
      }
      // endregion
    } catch ( error ) {
      // If any error occurs, consider it an incomplete migration
      const migrationData = {
        name:      source.name || "Unknown Talent",
        uuid:      `Item.${source._id}`,
        type:      source.type,
        id:        source._id
      };
      this.addIncompleteMigration( migrationData, error.message );
    }
    
    return source;
  }

  /**
   * Check for attributes that would make a talent incomplete
   * @param {object} source - The talent source data
   * @returns {object} Object with hasIssues boolean and reason string
   */
  static checkForIncompleteValues( source ) {
    const result = {
      hasIssues: false,
      reason:    ""
    };

    // Add more conditions as needed

    return result;
  }
}
