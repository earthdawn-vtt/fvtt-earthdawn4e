import RestrictionMigration from "../../field-migrations/knack-restriction.mjs";
import ImageMigration from "./image.mjs";
import BaseMigration from "../../../common/base-migration.mjs";
import EdIdMigration from "./edid.mjs";
import AbilityMigration from "./abilities.mjs";
import KnackSourceTalentMigration from "../../field-migrations/knack-source.mjs";
import RequirementsMigration from "../../field-migrations/knack-requirements.mjs";

export default class AbilityKnackMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {

    try {

      EdIdMigration.migrateEarthdawnData( source );
        
      AbilityMigration.migrateEarthdawnData( source );

      // Apply image migration
      ImageMigration.migrateEarthdawnData( source );

      RestrictionMigration.migrateEarthdawnData( source );

      RequirementsMigration.migrateEarthdawnData( source );

      KnackSourceTalentMigration.migrateEarthdawnData( source );

      if ( source.system ) {
      // Migrate Standard effect
        source.system.standardEffect = source.system.standardEffect || false;
      }

    
      // region Migration completeness check

      // Check for specific values that would cause a talent to be marked incomplete
      const hasIncompleteAttributes =  await this.checkForIncompleteValues( source );

      // If the talent has attributes that make it incomplete, add it to incomplete migrations
      if ( hasIncompleteAttributes.hasIssues ) {
        const migrationData = {
          name:      source.name || game.i18n.localize( "ED.Migrations.unknownTalent" ),
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
          name:      source.name || game.i18n.localize( "ED.Migrations.unknownTalent" ),
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
        name:      source.name || game.i18n.localize( "ED.Migrations.unknownTalent" ),
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
      result.reason += game.i18n.localize( "ED.Migrations.missingRollType" ) + " ";
    }

    // check for rolltype "attack" but missing weaponType
    if ( source.system.rollType === "attack" && !source.system.rollTypeDetails.attack.weaponType ) {
      result.hasIssues = true;
      result.reason += game.i18n.localize( "ED.Migrations.missingWeaponTypesAttack" ) + " ";
    }

    // check for missing attributes
    if ( !source.system.attributes || source.system.attributes.length === 0 ) {
      result.hasIssues = true;
      result.reason += game.i18n.localize( "ED.Migrations.missingAttributes" ) + " ";
    }

    // difficulty setting
    if ( !source.system.difficulty ) {
      result.hasIssues = true;
      result.reason += game.i18n.localize( "ED.Migrations.missingDifficulty" ) + " ";
    }

    // check for missing edid
    if ( !source.system.edid || source.system.edid === "none" ) {
      result.hasIssues = true;
      result.reason += game.i18n.localize( "ED.Migrations.missingEdid" ) + " ";
    }

    // Add error message for Restrictions if empty
    if ( !source.system.restrictions || source.system.restrictions.length === 0 ) {
      result.hasIssues = true;
      result.reason += game.i18n.localize( "ED.Migrations.missingRestrictions" ) + " ";
    }

    // Add error message for Requirements if empty
    if ( !source.system.requirements || source.system.requirements.length === 0 ) {
      result.hasIssues = true;
      result.reason += game.i18n.localize( "ED.Migrations.missingRequirements" ) + " ";
    }

    // Add more conditions as needed

    return result;
  }
}