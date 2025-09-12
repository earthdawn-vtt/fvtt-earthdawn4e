/* eslint-disable complexity */
import ImageMigration from "./image.mjs";
import BaseMigration from "../../../common/base-migration.mjs";
import ED4E from "../../../../../config/_module.mjs";

export default class SpellMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {

    try {

      // Apply image migration
      ImageMigration.migrateEarthdawnData( source );


      if ( !source.system?.spellcastingType && source.system?.discipline ) {

        const oldSpellcastingType = source.system.discipline.slugify( { lowercase: true, strict: true } );
      
        // Check against the spellcastingTypes array and assign the second value if found
        const matchedType = ED4E.MIGRATIONS.systemV0_8_2.spellcastingTypes.find( type => 
          type[0].slugify( { lowercase: true, strict: true } ) === oldSpellcastingType
        );
      
        source.system.spellcastingType = matchedType ? matchedType[1] : "elementarism";
      }

      // Migrate weaving and reattune difficulties
      if ( !source.system?.spellDifficulty ) {
        source.system.spellDifficulty ??= {};
        source.system.spellDifficulty.reattune = source.system.reattunedifficulty;
        source.system.spellDifficulty.weaving = source.system.weavingdifficulty;
      }

      // Migrate required threads
      if ( !source.system?.threads ) {
        source.system.threads ??= {};
        source.system.threads.required = source.system.threadsrequired;
      }

      if ( typeof source.system?.effect !== "object" ) {
        const oldSpellEffect = source.system.effect;
        source.system.effect = {};
        source.system.effect.details = {};
        source.system.effect.type = "special";
        source.system.effect.details.special = {};
        source.system.effect.details.special.description = oldSpellEffect + " " + game.i18n.localize( "ED.Migrations.setSpellEffect" );
      }

      if ( typeof source.system?.duration !== "object" ) {
        const oldDuration = source.system.duration;
        source.system.duration = {};
        source.system.duration.unit = "spec";
        source.system.duration.special = oldDuration + " " + game.i18n.localize( "ED.Migrations.setSpellDuration" );
      }

      if ( typeof source.system?.range !== "object" ) {
        const oldRange = source.system.range;
        source.system.range = {};
        source.system.range.unit = "spec";
        source.system.range.special = oldRange + " " + game.i18n.localize( "ED.Migrations.setSpellRange" );
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

    if ( !source.system.spellDifficulty.reattune ) {
      result.hasIssues = true;
      result.reason += "Missing reattune difficulty, please check. ";
    }

    if ( !source.system.spellDifficulty.weaving ) {
      result.hasIssues = true;
      result.reason += "Missing weaving difficulty, please check. ";
    }

    if ( !source.system.threads.required ) {
      result.hasIssues = true;
      result.reason += "Missing required threads, please check. ";
    } 

    if ( source.system.effect.details.special.description ) {
      result.hasIssues = true;
      result.reason += source.system.effect.details.special.description + " ";
    } 

    if ( source.system.duration.special ) {
      result.hasIssues = true;
      result.reason += source.system.duration.special + " ";
    }

    if ( source.system.range.special ) {
      result.hasIssues = true;
      result.reason += source.system.range.special + " ";
    }

    // Add more conditions as needed

    return result;
  }
}