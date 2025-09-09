import RollTypeMigration from "./roll-type-Migration.mjs";
import EdIdMigration from "./edid.mjs";
import AbilityMigration from "./abilities.mjs";
import ImageMigration from "./image.mjs";
import BaseMigration from "../../../common/base-migration.mjs";

export default class TalentMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {    
    // Only proceed if this is a talent
    if ( source.type !== "talent" ) {
      return source;
    }
    
    try {
      // Perform all migrations
      RollTypeMigration.migrateEarthdawnData( source );
      
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

      // Migration was successful - add to successful migrations
      const migrationData = {
        name:      source.name || "Unknown Talent",
        uuid:      source._stats?.compendiumSource || `Item.${source._id}`,
        type:      source.type,
        id:        source._id
      };
      this.addSuccessfulMigration( migrationData );
    } catch ( error ) {
      // If any error occurs, consider it an incomplete migration
      const migrationData = {
        name:      source.name || "Unknown Talent",
        uuid:      source._stats?.compendiumSource || `Item.${source._id}`,
        type:      source.type,
        id:        source._id
      };
      this.addIncompleteMigration( migrationData, error.message );
    }

    return source;
  }
}