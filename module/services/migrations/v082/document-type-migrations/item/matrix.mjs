/* eslint-disable complexity */
import ED4E from "../../../../../config/_module.mjs";
import { MatrixTemplate } from "../../../../../data/item/_module.mjs";
import BaseMigration from "../../../common/base-migration.mjs";


export default class MatrixMigration extends BaseMigration {

  /**
   * Initializes the matrix data structure for an item during migration
   * @param {object} source - The source object to initialize
   * @returns {object} The source object with initialized matrix data
   */
  static initializeMatrixData( source ) {

    const slugifiedName = source.name.slugify( { lowercase: true, strict: true } );
    
    // Extract old data we need to preserve
    const oldSystemData = foundry.utils.deepClone( source.system );
    
    // Determine matrix type
    let matrixType = "standard";
    if ( ED4E.systemV0_8_2.enhancedMatrixNames.some( name => 
      name.slugify( { lowercase: true, strict: true } ) === slugifiedName ) ) {
      matrixType = "enhanced";
    } else if ( ED4E.systemV0_8_2.armoredMatrixNames.some( name => 
      name.slugify( { lowercase: true, strict: true } ) === slugifiedName ) ) {
      matrixType = "armored";
    } else if ( ED4E.systemV0_8_2.sumMatrixNames.some( name => 
      name.slugify( { lowercase: true, strict: true } ) === slugifiedName ) ) {
      matrixType = "shared";
    }
    
    // Create a system object with essential info but preserve other properties
    const preservedSystem = foundry.utils.deepClone( oldSystemData );
    delete preservedSystem.edid;  
    delete preservedSystem.matrix;
    
    // Create the new system object
    source.system = {
      edid: "matrix",
      ...preservedSystem
    };
    
    // Create an instance of the matrix template
    const matrixModel = new MatrixTemplate( {
      matrix: {
        matrixType: matrixType,
      }
    } );
    
    // Create a changes object for the _prepareMatrixData method
    const changes = {};
    matrixModel._prepareMatrixData( changes );
    
    // Apply the prepared data to the source
    source.system.matrix = matrixModel.matrix;

    return source;
  }

  /**
   * Migrates Earthdawn data for matrix items
   * @param {object} source - The source object to migrate
   * @returns {object} The migrated source object
   */
  static async migrateEarthdawnData( source ) {

    try {

      source.system ??= {};
    
      // Check if this item needs matrix data initialization
      if ( source.system.edid === "matrix" ) {
      // Initialize matrix data if not already initialized
        if ( !source.system.matrix ) {
          this.initializeMatrixData( source );
        }
      }
    
      const slugifiedName = source.name.slugify( { lowercase: true, strict: true } );

      // Create arrays of slugified names
      const standardMatrixNamesSlugified = ED4E.systemV0_8_2.standardMatrixNames.map( name => 
        name.slugify( { lowercase: true, strict: true } ) );
      const enhancedMatrixNamesSlugified = ED4E.systemV0_8_2.enhancedMatrixNames.map( name => 
        name.slugify( { lowercase: true, strict: true } ) );
      const armoredMatrixNamesSlugified = ED4E.systemV0_8_2.armoredMatrixNames.map( name => 
        name.slugify( { lowercase: true, strict: true } ) );
      const sumMatrixNamesSlugified = ED4E.systemV0_8_2.sumMatrixNames.map( name => 
        name.slugify( { lowercase: true, strict: true } ) );

      // Now check if the slugified name is included in any of the slugified arrays
      const matrixPath = source.system.matrix;
      matrixPath.level = source.system.circle || 1;
      source.system.level = matrixPath.level;
      if ( standardMatrixNamesSlugified.includes( slugifiedName ) ) {
        matrixPath.deathRating = ED4E.MAGIC.matrixTypes.standard.deathRating;
        matrixPath.threads ??= {};
        matrixPath.threads.hold ??= {};
        matrixPath.threads.hold.value = ED4E.MAGIC.matrixTypes.standard.maxHoldThread;
      } else if ( enhancedMatrixNamesSlugified.includes( slugifiedName ) ) {
        matrixPath.deathRating = ED4E.MAGIC.matrixTypes.enhanced.deathRating;
        matrixPath.threads ??= {};
        matrixPath.threads.hold ??= {};
        matrixPath.threads.hold.value = ED4E.MAGIC.matrixTypes.enhanced.maxHoldThread;

      } else if ( armoredMatrixNamesSlugified.includes( slugifiedName ) ) {
        matrixPath.deathRating = ED4E.MAGIC.matrixTypes.armored.deathRating;
        matrixPath.threads ??= {};
        matrixPath.threads.hold ??= {};
        matrixPath.threads.hold.value = ED4E.MAGIC.matrixTypes.armored.maxHoldThread;

      } else if ( sumMatrixNamesSlugified.includes( slugifiedName ) ) {
        matrixPath.deathRating = ED4E.MAGIC.matrixTypes.shared.deathRating;
        matrixPath.threads ??= {};
        matrixPath.threads.hold ??= {};
        matrixPath.threads.hold.value = ED4E.MAGIC.matrixTypes.shared.maxHoldThread;

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

    // Add more conditions as needed

    return result;
  }
}