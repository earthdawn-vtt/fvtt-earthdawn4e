import RollTypeMigration from "./roll-type-Migration.mjs";
import EdIdMigration from "./edid.mjs";
import AbilityMigration from "./abilities.mjs";
import ImageMigration from "./image.mjs";
import BaseMigration from "../../../common/base-migration.mjs";

export default class TalentMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {    RollTypeMigration.migrateEarthdawnData( source );
    
    EdIdMigration.migrateEarthdawnData( source );
    
    AbilityMigration.migrateEarthdawnData( source );
    
    ImageMigration.migrateEarthdawnData( source );
    
    // DefenseMigration.migrateEarthdawnData( source );

    // Additional talent-specific migration logic
    // Migrate rollTypes healing
    if ( source.system.healing > 0 ) {
      source.system.rollType ??= "recovery";
    }

    // Migrate Talent category
    if ( source.system.talentCategory ) {
      if ( source.system.talentCategory?.slugify( { lowercase: true, strict: true } ) === "racial" ) {
        source.system.talentCategory = "free";
      } else {
        source.system.talentCategory = source.system.talentCategory.slugify( { lowercase: true, strict: true } );
      } 
    } else if ( !source.system.talentCategory ) {
      source.system.talentCategory = "other";
    }

    return source;
  }
}