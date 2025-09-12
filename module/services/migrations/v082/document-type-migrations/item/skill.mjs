
import ED4E from "../../../../../config/_module.mjs";
import AbilityMigration from "./abilities.mjs";
import EdIdMigration from "./edid.mjs";
import ImageMigration from "./image.mjs";
import RollTypeMigration from "./roll-type-Migration.mjs";
import BaseMigration from "../../../common/base-migration.mjs";

export default class SkillMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {   
    
    try {
    
      RollTypeMigration.migrateEarthdawnData( source );
    
      EdIdMigration.migrateEarthdawnData( source );
    
      AbilityMigration.migrateEarthdawnData( source );
    
      ImageMigration.migrateEarthdawnData( source );

      const slugifiedName = source.name.slugify( { lowercase: true, strict: true } );

      if ( !source.skillType ) {
        if ( ED4E.systemV0_8_2.artisan.some( artisanSkill =>
          slugifiedName.includes( artisanSkill.slugify( { lowercase: true, strict: true } ) ) ) ) {
          source.system.skillType = "artisan"; 
        } else if ( ED4E.systemV0_8_2.knowledge.some( knowledgeSkill =>
          slugifiedName.includes( knowledgeSkill.slugify( { lowercase: true, strict: true } ) ) ) ) {
          source.system.skillType = "knowledge"; 
        } else {
          source.system.skillType = "general";
        }
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

    // Add more conditions as needed

    return result;
  }
}