import ImageMigration from "./image.mjs";
import BaseMigration from "../../../common/base-migration.mjs";
import DifficultyMigration from "../../field-migrations/difficulty.mjs";
import ActionMigration from "../../field-migrations/action.mjs";

export default class PowerMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {

    try {

      // Apply image migration
      ImageMigration.migrateEarthdawnData( source );

      DifficultyMigration.migrateEarthdawnData( source );

      ActionMigration.migrateEarthdawnData( source );

      if ( !source.system.powerStep ) {
        source.system.powerStep = source.system.attackstep;
      }

      if ( !source.system.damageStep ) {
        source.system.damageStep = source.system.damagestep;
      }

      if ( !source.system.rollType && source.system.powerType.slugify( { lowercase: true, strict: true } ) === "attack" ) {
        source.system.rollType = "attack";
      } else if ( !source.system.rollType && source.system.powerStep > 0 ){
        source.system.rollType = "ability";
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

    // Note: Data model migration is handled by field-level migrations
    // config[source.type] represents data models, not migration classes

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

    if ( !source.system.powerType ) {
      result.hasIssues = true;
      result.reason += "Missing power type, please check. ";
    }
    
    // check for rolltype "attack" but missing damageStep
    if ( source.system.rollType === "attack" && !source.system.damageStep ) {
      result.hasIssues = true;
      result.reason += "Missing damage step for attack power, please check. ";
    }

    // check for missing rolltype
    if ( !source.system.rollType ) {
      result.hasIssues = true;
      result.reason += "Missing rollType, please check. ";
    }
    // Add more conditions as needed

    return result;
  }
}