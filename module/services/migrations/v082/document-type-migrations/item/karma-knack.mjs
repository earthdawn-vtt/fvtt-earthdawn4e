
import BaseMigration from "../../../common/base-migration.mjs";
import RequirementsMigration from "../../field-migrations/knack-requirements.mjs";
import RestrictionMigration from "../../field-migrations/knack-restriction.mjs";
import EdIdMigration from "./edid.mjs";
import ImageMigration from "./image.mjs";

export default class KarmaKnackMigration extends BaseMigration {
  

  static async migrateEarthdawnData( source ) {

    try {

      EdIdMigration.migrateEarthdawnData( source );

      // Apply image migration
      ImageMigration.migrateEarthdawnData( source );

      
      RestrictionMigration.migrateEarthdawnData( source );
      
      RequirementsMigration.migrateEarthdawnData( source );


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

    // check for missing edid
    if ( !source.system.edid || source.system.edid === "none" ) {
      result.hasIssues = true;
      result.reason += game.i18n.localize( "ED.Migrations.missingEdid" ) + " ";
    }

    // Add more conditions as needed

    return result;
  }
}