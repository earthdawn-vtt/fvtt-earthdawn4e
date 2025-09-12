import ImageMigration from "./image.mjs";
import BaseMigration from "../../../common/base-migration.mjs";
import ED4E from "../../../../../config/_module.mjs";

export default class NamegiverMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {

    if ( source.system && source.system.edid === undefined ) {
      try {
    
        // Apply image migration
        ImageMigration.migrateEarthdawnData( source );

        
        // Migrate attributes
        if ( !source.system.attributeValues ) {
          if (
            Object.keys( source.system.attributes )
              .some( attr => ED4E.MIGRATIONS.systemV0_8_2.attributeValues.includes( attr ) )
          ) {
            const old = source.system.attributes;
            source.system.attributeValues = {
              dex:     old.dexterityvalue ?? 10,
              str:     old.strengthvalue ?? 10,
              tou:     old.toughnessvalue ?? 10,
              per:     old.perceptionvalue ?? 10,
              wil:     old.willpowervalue ?? 10,
              cha:     old.charismavalue ?? 10,
            };
          }
        }
   
        // Migrate karma modifier
        source.system.karmaModifier = source.system.karmamodifier;

        // Migrate movement
        source.system.movement = {walk:  source.system.movement};

        // Migrate Namegiver ability description.
        if ( source.system.description.value ) {
          // yes there is a spelling mistake in the old system.
          source.system.description.value += "<br>" + source.system.racialAbilites;
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

    // Add more conditions as needed

    return result;
  }
}