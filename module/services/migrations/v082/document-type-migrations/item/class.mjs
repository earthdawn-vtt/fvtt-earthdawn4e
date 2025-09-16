import ImageMigration from "./image.mjs";
import BaseMigration from "../../../common/base-migration.mjs";

export default class ClassMigration extends BaseMigration {

  /**
   * Migrate legacy description format.
   * @param {object} source - The source data object
   */
  static migrateLegacyDescription( source ) {
    if ( typeof source?.description === "string" && source?.description !== undefined ) {
      source.description = source.description + source.descriptionGameInfo;
      // Note: DescriptionMigration would be called here if available
      // DescriptionMigration.migrateData( source );
    }
  }
  
  /**
   * Validate a talent UUID and check if it looks like a valid UUID
   * @param {string} talent - The talent UUID to validate
   * @param {string} tier - The tier name for error reporting
   * @param {object} source - The source data object for adding error info
   * @returns {boolean} - Whether the talent looks like a valid UUID
   */
  static validateTalentUuid( talent, tier, source ) {
    // Regular expression to check if a string looks like a UUID reference
    const uuidPattern = /^(Compendium\.|UUID\.Compendium\.)[^.]+\.[^.]+\.Item\.[a-zA-Z0-9]{16}$/;
    
    if ( uuidPattern.test( talent ) ) {
      return true;
    } else {
      // Add to migration report if it doesn't look like a UUID
      source.description ??= {};
      source.description.value ??= "";
      source.description.value += `<p><strong>Invalid talent UUID format in ${tier} tier:</strong></p><p>${talent}</p>`;
      return false;
    }
  }

  /**
   * Migrate tier-based talent pools from legacy format.
   * @param {object} source - The source data object
   */
  static migrateTierTalentPools( source ) {
    if ( !source?.system?.descriptionNovice ) return;

    // Parse talent links from descriptions
    const novicePoolTalents = this.parseTalentLinks( source.system.descriptionNovice );
    let journeymanPoolTalents = this.parseTalentLinks( source.system.descriptionJourneyman );
    journeymanPoolTalents = journeymanPoolTalents.filter( talent => !novicePoolTalents.includes( talent ) );
    let wardenPoolTalents = this.parseTalentLinks( source.system.descriptionWarden );
    wardenPoolTalents = wardenPoolTalents.filter( talent => !novicePoolTalents.includes( talent ) && !journeymanPoolTalents.includes( talent ) );
    let masterPoolTalents = this.parseTalentLinks( source.system.descriptionMaster );
    masterPoolTalents = masterPoolTalents.filter( talent => !novicePoolTalents.includes( talent ) && !journeymanPoolTalents.includes( talent ) && !wardenPoolTalents.includes( talent ) );
  
    // Filter and validate each tier's talent pool
    const validatedNoviceTalents = novicePoolTalents.filter( talent => this.validateTalentUuid( talent, "novice", source ) );
    const validatedJourneymanTalents = journeymanPoolTalents.filter( talent => this.validateTalentUuid( talent, "journeyman", source ) );
    const validatedWardenTalents = wardenPoolTalents.filter( talent => this.validateTalentUuid( talent, "warden", source ) );
    const validatedMasterTalents = masterPoolTalents.filter( talent => this.validateTalentUuid( talent, "master", source ) );
    
    // Initialize necessary objects
    source.system ??= {};
    source.system.advancement ??= {};
    source.system.advancement.abilityOptions ??= {};
  
    // Assign talent pools to their respective tiers
    this.assignTalentsToTier( source, "novice", validatedNoviceTalents );
    this.assignTalentsToTier( source, "journeyman", validatedJourneymanTalents );
    this.assignTalentsToTier( source, "warden", validatedWardenTalents );
    this.assignTalentsToTier( source, "master", validatedMasterTalents );
  }

  /**
   * Assign talents to a specific tier.
   * @param {object} source - The source data object
   * @param {string} tier - The tier name
   * @param {string[]} talents - Array of talent UUIDs
   */
  static assignTalentsToTier( source, tier, talents ) {
    for ( const talent of talents ) {
      source.system.advancement.abilityOptions[tier] ??= [];
      source.system.advancement.abilityOptions[tier].push( talent );
    }
  }

  /**
   * Create default levels and migrate circle-specific talents.
   * @param {object} source - The source data object
   */
  static migrateCircleLevels( source ) {
    if ( !source ) return;

    // Skip if levels already exist - never overwrite existing level data
    if ( source.system?.advancement?.levels?.length > 0 ) {
      // Even if levels exist, ensure they have the proper 'level' property
      source.system.advancement.levels = source.system.advancement.levels.map( ( levelData, i ) => {
        if ( !levelData.level || typeof levelData.level !== "number" ) {
          levelData.level = i + 1;
        }
        return this.ensureLevelDataSerializable( levelData );
      } );
      return; // Already has levels with proper level numbers, don't recreate
    }

    // Create advancement structure even if no legacy fields (for new disciplines)
    source.system ??= {};
    source.system.advancement ??= {};
    source.system.advancement.levels = [];
  
    // Hardcoded tier mapping to avoid dependency issues during migration
    const tierByCircle = {
      1:  "novice",
      2:  "novice",
      3:  "novice",
      4:  "novice",
      5:  "journeyman",
      6:  "journeyman",
      7:  "journeyman",
      8:  "journeyman",
      9:  "warden",
      10: "warden",
      11: "warden",
      12: "warden",
      13: "master",
      14: "master",
      15: "master",
    };
  
    // Create 15 levels, ensuring we have the proper data structure with explicit level numbers
    for ( let i = 1; i <= 15; i++ ) {
      const levelData = this.createLevelData( i, tierByCircle[i] );
      this.migrateLevelTalents( source, levelData, i );
      
      // Ensure data is properly serialized (convert any Sets to Arrays)
      // and that level number is explicitly set
      const serializedLevel = this.ensureLevelDataSerializable( levelData );
      // Explicitly ensure the level property is set
      serializedLevel.level = i;
      source.system.advancement.levels.push( serializedLevel );
    }
    
    // Convert ability options to ensure they're properly serialized
    if ( source.system.advancement.abilityOptions ) {
      for ( const [ tier, talents ] of Object.entries( source.system.advancement.abilityOptions ) ) {
        // Convert Sets or other collection types to plain arrays
        if ( talents && typeof talents !== "string" ) {
          source.system.advancement.abilityOptions[tier] = 
            Array.isArray( talents ) ? talents : Array.from( talents );
        }
      }
    }
  }
  
  /**
   * Ensure level data is properly serializable by converting Sets to Arrays
   * @param {object} levelData - The level data to serialize
   * @returns {object} - Serializable level data
   */
  static ensureLevelDataSerializable( levelData ) {
    // Create a fresh copy to avoid modifying the original
    const serialized = foundry.utils.deepClone( levelData );
    
    // Ensure level property is set and is a number
    if ( !serialized.level || typeof serialized.level !== "number" ) {
      console.warn( "Level data is missing level number or it's not a number", serialized );
    }
    
    // Convert ability collections to arrays
    if ( serialized.abilities ) {
      for ( const [ key, collection ] of Object.entries( serialized.abilities ) ) {
        if ( collection && typeof collection !== "string" ) {
          serialized.abilities[key] = Array.isArray( collection ) ? collection : Array.from( collection );
        }
      }
    }
    
    // Convert effects to array if needed
    if ( serialized.effects && typeof serialized.effects !== "string" ) {
      serialized.effects = Array.isArray( serialized.effects ) ? serialized.effects : Array.from( serialized.effects );
    }
    
    return serialized;
  }

  /**
   * Create level data structure.
   * @param {number} level - The level number
   * @param {string} tier - The tier name
   * @returns {object} Level data object
   */
  static createLevelData( level, tier ) {
    return {
      level,
      tier,
      abilities: {
        class:   [],
        free:    [],
        special: []
      },
      effects:      [],
      resourceStep: level < 13 ? 4 : 5,
    };
  }

  /**
   * Migrate talents for a specific level from circle descriptions.
   * @param {object} source - The source data object
   * @param {object} levelData - The level data object to populate
   * @param {number} circleNumber - The circle number
   */
  static migrateLevelTalents( source, levelData, circleNumber ) {
    const circleDescriptionKey = `descriptionCircle${circleNumber}`;
    if ( source.system?.[circleDescriptionKey] ) {
      const classTalents = this.parseTalentLinks( source.system[circleDescriptionKey] );
      levelData.abilities.class = this.validateAndFilterTalents( classTalents, circleNumber, source );
    }
  }

  /**
   * Validate talent UUIDs and return only valid ones.
   * @param {string[]} talentUuids - Array of talent UUIDs to validate
   * @param {number} circleNumber - The circle number for error reporting
   * @param {object} source - The source data object for adding error info
   * @returns {string[]} - Array of valid talent UUIDs
   */
  static validateAndFilterTalents( talentUuids, circleNumber, source ) {
    const validTalents = [];
    
    // Skip if we don't have a valid array of talent UUIDs
    if ( !Array.isArray( talentUuids ) || !talentUuids.length ) {
      return [];
    }
    
    // Regular expression to check if a string looks like a UUID reference
    const uuidPattern = /^(Compendium\.|UUID\.Compendium\.)[^.]+\.[^.]+\.Item\.[a-zA-Z0-9]{16}$/;
    
    // Initialize description if needed
    source.description ??= {};
    source.description.value ??= "";
    
    for ( const talent of talentUuids ) {
      // Skip undefined or null entries
      if ( !talent ) continue;
      
      try {
        const item = fromUuidSync( talent );
        if ( item ) {
          // Successfully resolved UUID
          validTalents.push( item.uuid );
        } else if ( uuidPattern.test( talent ) ) {
          // String looks like a UUID but couldn't be resolved - add it anyway
          validTalents.push( talent );
          // Also note in description that this might be a module issue
          source.description.value += `<h3>Circle${circleNumber}</h3><p><strong>Potential module dependency:</strong></p><p>Talent ${talent} could not be resolved. It will be included, but requires the corresponding module to be activated.</p>`;
        } else { 
          // Not a valid UUID format
          source.description.value += `<h3>Circle${circleNumber}</h3><p><strong>Unsolved migration object:</strong></p><p>${talent}</p>`;
        }
      } catch ( error ) {
        // If fromUuidSync fails, check if it looks like a UUID
        if ( uuidPattern.test( talent ) ) {
          // String looks like a UUID but couldn't be resolved - add it anyway
          validTalents.push( talent );
          // Also note in description that this might be a module issue
          source.description.value += `<h3>Circle${circleNumber}</h3><p><strong>Potential module dependency:</strong></p><p>Talent ${talent} could not be resolved. It will be included, but requires the corresponding module to be activated.</p>`;
        } else {
          // Not a valid UUID format or other error
          source.description.value += `<h3>Circle${circleNumber}</h3><p><strong>Unsolved migration object:</strong></p><p>${talent}</p>`;
        }
      }
    }
    console.log( "validTalents", validTalents );
    return validTalents;
  }

  /**
   * Parse talent links from description text.
   * @param {string} input   The input string containing talent links.
   * @returns {string[]}     Array of parsed talent UUIDs.
   */    
  static parseTalentLinks( input ) {
    if ( !input ) return [];
    
    // Remove HTML tags and quotes
    let clean = input.replace( /<[^>]+>/g, "" ).replace( /"/g, "" ).trim();

    // Split by '@' and filter out empty entries
    let parts = clean.split( "@" ).filter( Boolean );

    return parts.map( part => {
      let cleanPart = part;
      // Remove everything in {} including the brackets
      cleanPart = cleanPart.replace( /\{[^}]*\}/g, "" );
      // Replace [<compendium>.<collection>. with .<compendium>.<collection>.Item.
      cleanPart = cleanPart.replace(
        /\[([^.]+\.[^.]+\.)/,
        ( match, p1 ) => "." + p1 + "Item."
      );
      // Remove all ]
      cleanPart = cleanPart.replace( /\]/g, "" );
      // Remove trailing commas and whitespace
      cleanPart = cleanPart.replace( /,\s*$/, "" ).trim();
      // Remove \n and &nbsp;
      cleanPart = cleanPart.replace( /\n/g, "" ).replace( /&nbsp;/g, "" );
      return cleanPart;
    } );
  }

  /**
   * Check for attributes that would make a talent incomplete
   * @param {object} source - The talent source data
   * @returns {object} Object with hasIssues boolean and reason string
   */
  static async checkForIncompleteValues( source ) {
    const result = {
      hasIssues: false,
      reason:    ""
    };

    // check pools for missing entries
    if ( source.system?.advancement?.abilityOptions ) {
      const pools = source.system.advancement.abilityOptions;
      for ( const [ key, value ] of Object.entries( pools ) ) {
        if ( !value || value === "none" ) {
          result.hasIssues = true;
          result.reason += `Missing or undefined ability option '${key}', please check. `;
        }
      }
    }

    // check for missing vocation talents
    if ( source.type === "discipline" ) {
      for ( let circle = 1; circle <= 15; circle++ ) {
        const level = source.system?.advancement?.levels?.find( lvl => lvl.level === circle );
        if ( level ) {
          if ( level.level === 1 && level.abilities.class.length < 5 ) {
            result.hasIssues = true;
            result.reason += `Probably missing Discipline talents for circle ${circle}, please check. `;
          }
          if ( level.abilities.class.length === 0 ) {
            result.hasIssues = true;
            result.reason += `Missing Discipline talents for circle ${circle}, please check. `;
          }
        }
      }

      if ( !source.system.durability ) {
        result.hasIssues = true;
        result.reason += "Missing durability value, please check. ";
      }
    }

    // Add more conditions as needed

    return result;
  }

  /**
   * Ensure all source data is properly serializable and doesn't contain complex objects
   * @param {object} source - The source data to prepare
   * @returns {object} - The prepared source data
   */
  static prepareSourceData( source ) {
    // Create a deep copy to avoid modifying the original
    const prepared = foundry.utils.deepClone( source );
    
    // Ensure advancement structure exists
    if ( !prepared.system?.advancement ) return prepared;
    
    // Process levels
    if ( Array.isArray( prepared.system.advancement.levels ) ) {
      prepared.system.advancement.levels = prepared.system.advancement.levels.map( 
        ( level, index ) => {
          const serializedLevel = this.ensureLevelDataSerializable( level );
          // Always ensure level number is set, using index+1 if necessary
          if ( !serializedLevel.level || typeof serializedLevel.level !== "number" ) {
            serializedLevel.level = index + 1;
          }
          return serializedLevel;
        }
      );
    }
    
    // Process ability options
    if ( prepared.system.advancement.abilityOptions ) {
      for ( const [ tier, talents ] of Object.entries( prepared.system.advancement.abilityOptions ) ) {
        if ( talents && typeof talents !== "string" ) {
          prepared.system.advancement.abilityOptions[tier] = 
            Array.isArray( talents ) ? talents : Array.from( talents );
        }
      }
    }
    
    return prepared;
  }
  
  /**
   * Migrate Earthdawn data
   * @param {object} source - The source data object
   * @returns {object} - The migrated source data object
   */
  static async migrateEarthdawnData( source ) {
    try {
      if ( source.system?.discipline ) {
        source.type = source.system.discipline;
      }

      // Apply image migration first
      ImageMigration.migrateEarthdawnData( source );

      // Skip migration if already properly migrated (has levels)
      if ( source?.system?.advancement?.levels?.length > 0 ) {
        return this.prepareSourceData( source );
      }

      // Migrate basic description data
      this.migrateLegacyDescription( source );
    
      // Migrate tier-based talent pools
      this.migrateTierTalentPools( source );
    
      // Create default levels and migrate circle-specific talents
      this.migrateCircleLevels( source );

      // set the circle
      if ( source.system?.circle ) {
        source.system.level = source.system.circle;
      }

      // Ensure all data is properly serializable
      const preparedSource = this.prepareSourceData( source );
      
      // Update source with prepared data
      Object.assign( source, preparedSource );

      // region Migration completeness check

      // Check for specific values that would cause a talent to be marked incomplete
      const hasIncompleteAttributes = await this.checkForIncompleteValues( source );

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