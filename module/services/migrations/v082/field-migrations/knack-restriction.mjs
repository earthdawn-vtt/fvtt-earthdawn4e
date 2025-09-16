import BaseMigration from "../../common/base-migration.mjs";

export default class RestrictionMigration extends BaseMigration {

  static migrateEarthdawnData( source ) {
    // Initialize restrictions as an empty array if it doesn't exist
    if (!source.system.restrictions || !Array.isArray(source.system.restrictions)) {
      source.system.restrictions = [];
    }
    
    // Check each item in the array to ensure it has a valid structure
    // Remove any undefined or invalid entries
    if (source.system.restrictions.length > 0) {
      source.system.restrictions = source.system.restrictions.filter(restriction => {
        return restriction && typeof restriction === 'object' && restriction.type;
      });
    }
  }
}