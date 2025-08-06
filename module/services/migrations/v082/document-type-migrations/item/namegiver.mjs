import ImageMigration from "./image.mjs";
import BaseMigration from "../../../common/base-migration.mjs";

export default class NamegiverMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {
    
    // Apply image migration
    ImageMigration.migrateEarthdawnData( source );
  
    return source;
  }
}