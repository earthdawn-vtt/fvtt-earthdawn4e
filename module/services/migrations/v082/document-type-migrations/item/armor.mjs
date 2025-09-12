import ImageMigration from "./image.mjs";
import BaseMigration from "../../../common/base-migration.mjs";

export default class ArmorMigration extends BaseMigration {
  static async migrateEarthdawnData( source ) {

    try {

      ImageMigration.migrateEarthdawnData( source );

      // migrate armor values
      source.system.physical ??= {};
      source.system.physical.armor ??= Number( source.system.Aphysicalarmor ) ? Number( source.system.Aphysicalarmor ) : 0;
      source.system.physical.forgeBonus ??= Number( source.system.timesForgedPhysical ) ? Number( source.system.timesForgedPhysical ) : 0;
      source.system.mystical ??= {};
      source.system.mystical.armor ??= Number( source.system.Amysticarmor ) ? Number( source.system.Amysticarmor ) : 0;
      source.system.mystical.forgeBonus ??= Number( source.system.timesForgedMystic ) ? Number( source.system.timesForgedMystic ) : 0;
      source.system.initiativePenalty ??= Number( source.system.armorPenalty ) ? Number( source.system.armorPenalty ) : 0;
      source.system.isLiving = source.system.isLiving ?? false; // Document field, not system 

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

    if ( !source.system.physical.armor ) {
      result.hasIssues = true;
      result.reason += "Missing physical armor value, please check. ";
    }

    if ( !source.system.mystical.armor ) {
      result.hasIssues = true;
      result.reason += "Missing mystical armor value, please check. ";
    }

    if ( !source.system.physical.forgeBonus ) {
      result.hasIssues = true;
      result.reason += "Physical forge bonus cannot be negative, please check. ";
    }

    if ( !source.system.mystical.forgeBonus ) {
      result.hasIssues = true;
      result.reason += "Mystical forge bonus cannot be negative, please check. ";
    }

    // Add more conditions as needed

    return result;
  }
}