import RestrictionMigration from "../../field-migrations/knack-restriction.mjs";
import ImageMigration from "./image.mjs";
import BaseMigration from "../../../common/base-migration.mjs";

export default class KnackMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {
    // Apply image migration
    ImageMigration.migrateEarthdawnData( source );

    RestrictionMigration.migrateEarthdawnData( source );

    // Note: Data model migration is handled by field-level migrations
    // config[source.type] represents data models, not migration classes
  
    return source;
  }
}