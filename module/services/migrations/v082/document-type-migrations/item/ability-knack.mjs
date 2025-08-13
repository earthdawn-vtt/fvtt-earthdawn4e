import RestrictionMigration from "../../field-migrations/knack-restriction.mjs";
import ImageMigration from "./image.mjs";
import BaseMigration from "../../../common/base-migration.mjs";
import EdIdMigration from "./edid.mjs";
import AbilityMigration from "./abilities.mjs";
import KnackSourceTalentMigration from "../../field-migrations/knack-source.mjs";

export default class AbilityKnackMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {

    EdIdMigration.migrateEarthdawnData( source );
        
    AbilityMigration.migrateEarthdawnData( source );

    // Apply image migration
    ImageMigration.migrateEarthdawnData( source );

    RestrictionMigration.migrateEarthdawnData( source );

    KnackSourceTalentMigration.migrateEarthdawnData( source );

    if ( source.system ) {
      // Migrate Standard effect
      source.system.standardEffect = source.system.standardEffect || false;
    }

    


  
    return source;
  }
}