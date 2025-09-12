
import ED4E from "../../../../../config/_module.mjs";
import ImageMigration from "./image.mjs";
import BaseMigration from "../../../common/base-migration.mjs";

export default class ShieldMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {

    try {
  
      ImageMigration.migrateEarthdawnData( source );

      // set bow usage based on slugified name
      const slugifiedName = source.name.slugify( { lowercase: true, strict: true } );

      if ( ED4E.systemV0_8_2.shieldBowUsageNames.some( shieldNames =>
        slugifiedName.includes( shieldNames.slugify( { lowercase: true, strict: true } ) ) ) ) {
        source.system.bowUsage = true;
      }

      // migrate shield specific data
      source.system.defenseBonus ??= {};
      source.system.defenseBonus.physical ??= source.system.physicaldefense;
      source.system.defenseBonus.mystical ??= source.system.mysticdefense;
      source.system.initiativePenalty ??= source.system.initiativepenalty;
      source.system.shatterThreshold ??= source.system.shatterthreshold;

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

    // check for missing physical defense
    if ( !source.system.defenseBonus.physical ) {
      result.hasIssues = true;
      result.reason += "Missing physical defense bonus, please check. ";
    }

    // check for missing mystical defense
    if ( !source.system.defenseBonus.mystical ) {
      result.hasIssues = true;
      result.reason += "Missing mystical defense bonus, please check. ";
    } 

    // check for missing initiative penalty
    if ( !source.system.initiativePenalty ) {
      result.hasIssues = true;
      result.reason += "Missing initiative penalty, please check. ";
    }

    // check for missing shatter threshold
    if ( !source.system.shatterThreshold ) {
      result.hasIssues = true;
      result.reason += "Missing shatter threshold, please check. ";
    }

    // Add more conditions as needed

    return result;
  }
}