import BaseMigration from "../../../common/base-migration.mjs";
import RequirementsMigration from "../../field-migrations/knack-requirements.mjs";
import RestrictionMigration from "../../field-migrations/knack-restriction.mjs";
import EdIdMigration from "./edid.mjs";
import ImageMigration from "./image.mjs";

export default class ManeuverKnackMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {

    EdIdMigration.migrateEarthdawnData( source );

    // Apply image migration
    ImageMigration.migrateEarthdawnData( source );

    RestrictionMigration.migrateEarthdawnData( source );
    
    RequirementsMigration.migrateEarthdawnData( source );
  
    return source;
  }
}