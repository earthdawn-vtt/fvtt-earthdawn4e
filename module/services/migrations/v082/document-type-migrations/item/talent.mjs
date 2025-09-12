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

    // check for missing rolltype
    if ( !source.system.rollType ) {
      result.hasIssues = true;
      result.reason += "Missing rollType, please check. ";
    }

    // check for rolltype "attack" but missing weaponType
    if ( source.system.rollType === "attack" && !source.system.weaponType ) {
      result.hasIssues = true;
      result.reason += "Missing weapon Types for attack rollType, please check. ";
    }

    // check for missing attributes
    if ( !source.system.attribute ) {
      result.hasIssues = true;
      result.reason += "Missing attributes, please check. ";
    }

    // difficulty setting
    if ( !source.system.difficulty ) {
      result.hasIssues = true;
      result.reason += "Missing difficulty setting, please check. ";
    }

    // check for missing edid
    if ( !source.system.edid || source.system.edid === "none" ) {
      result.hasIssues = true;
      result.reason += "Missing or undefined edid, please check. ";
    }

    // check for missing talent category
    if ( !source.system.talentCategory ) {
      result.hasIssues = true;
      result.reason += "Missing talent category, please check. ";
    }

    // Add more conditions as needed

    return result;
  }
}