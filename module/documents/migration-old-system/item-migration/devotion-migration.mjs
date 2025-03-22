import ActionMigration from "../migration-partials/action-migration.mjs";
import EdIdMigration from "../migration-partials/ed-id-migration.mjs";

export default class DevotionMigration {
    
  static async migrateData( source ) {

    ActionMigration.migrateData( source );
    
    EdIdMigration.migrateData( source );

    return source; // Return the modified data
  }
}