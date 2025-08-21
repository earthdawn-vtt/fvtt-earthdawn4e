import ImageMigration from "./image.mjs";
import BaseMigration from "../../../common/base-migration.mjs";

export default class DisciplineMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {

    if ( source.system?.discipline ) {
      source.type = source.system.discipline;
    }

    // Apply image migration first
    ImageMigration.migrateEarthdawnData( source );

    // Skip migration if already properly migrated (has levels)
    if ( source?.system?.advancement?.levels?.length > 0 ) {
      return source;
    }

    // Migrate basic description data
    migrateLegacyDescription( source );
    
    // Migrate tier-based talent pools
    migrateTierTalentPools( source );
    
    // Create default levels and migrate circle-specific talents
    migrateCircleLevels( source );

    // set the circle
    if ( source.system?.circle ) {
      source.system.level = source.system.circle;
    }

    /**
     * Migrate legacy description format.
     * @param {object} source - The source data object
     */
    function migrateLegacyDescription( source ) {
      if ( typeof source?.description === "string" && source?.description !== undefined ) {
        source.description = source.description + source.descriptionGameInfo;
        // Note: DescriptionMigration would be called here if available
        // DescriptionMigration.migrateData( source );
      }
    }

    /**
     * Migrate tier-based talent pools from legacy format.
     * @param {object} source - The source data object
     */
    function migrateTierTalentPools( source ) {
      if ( !source?.system?.descriptionNovice ) return;

      const novicePoolTalents = parseTalentLinks( source.system.descriptionNovice );
      let journeymanPoolTalents = parseTalentLinks( source.system.descriptionJourneyman );
      journeymanPoolTalents = journeymanPoolTalents.filter( talent => !novicePoolTalents.includes( talent ) );
      let wardenPoolTalents = parseTalentLinks( source.system.descriptionWarden );
      wardenPoolTalents = wardenPoolTalents.filter( talent => !novicePoolTalents.includes( talent ) && !journeymanPoolTalents.includes( talent ) );
      let masterPoolTalents = parseTalentLinks( source.system.descriptionMaster );
      masterPoolTalents = masterPoolTalents.filter( talent => !novicePoolTalents.includes( talent ) && !journeymanPoolTalents.includes( talent ) && !wardenPoolTalents.includes( talent ) );
      
      source.system ??= {};
      source.system.advancement ??= {};
      source.system.advancement.abilityOptions ??= {};
      
      // Assign talent pools to their respective tiers
      assignTalentsToTier( source, "novice", novicePoolTalents );
      assignTalentsToTier( source, "journeyman", journeymanPoolTalents );
      assignTalentsToTier( source, "warden", wardenPoolTalents );
      assignTalentsToTier( source, "master", masterPoolTalents );
    }

    /**
     * Assign talents to a specific tier.
     * @param {object} source - The source data object
     * @param {string} tier - The tier name
     * @param {string[]} talents - Array of talent UUIDs
     */
    function assignTalentsToTier( source, tier, talents ) {
      for ( const talent of talents ) {
        source.system.advancement.abilityOptions[tier] ??= [];
        source.system.advancement.abilityOptions[tier].push( talent );
      }
    }

    /**
     * Create default levels and migrate circle-specific talents.
     * @param {object} source - The source data object
     */
    function migrateCircleLevels( source ) {
      if ( !source ) return;

      // Skip if levels already exist - never overwrite existing level data
      if ( source.system?.advancement?.levels?.length > 0 ) {
        return; // Already has levels, don't overwrite
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
      
      // Create 15 levels
      for ( let i = 1; i <= 15; i++ ) {
        const levelData = createLevelData( i, tierByCircle[i] );
        migrateLevelTalents( source, levelData, i );
        source.system.advancement.levels.push( levelData );
      }
      console.log( `[DisciplineMigration] Created ${source.system.advancement.levels.length} levels` );
    }

    /**
     * Create level data structure.
     * @param {number} level - The level number
     * @param {string} tier - The tier name
     * @returns {object} Level data object
     */
    function createLevelData( level, tier ) {
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
    function migrateLevelTalents( source, levelData, circleNumber ) {
      const circleDescriptionKey = `descriptionCircle${circleNumber}`;
      if ( source.system?.[circleDescriptionKey] ) {
        const classTalents = parseTalentLinks( source.system[circleDescriptionKey] );
        levelData.abilities.class = validateAndFilterTalents( classTalents, circleNumber );
      }
    }

    /**
     * Validate talent UUIDs and return only valid ones.
     * @param {string[]} talentUuids - Array of talent UUIDs to validate
     * @param {number} circleNumber - The circle number for error reporting
     * @returns {string[]} - Array of valid talent UUIDs
     */
    function validateAndFilterTalents( talentUuids, circleNumber ) {
      const validTalents = [];
      for ( const talent of talentUuids ) {
        try {
          const item = fromUuidSync( talent );
          if ( item ) {
            validTalents.push( item.uuid );
          } else { 
            // Add migration error info to description
            source.description ??= {};
            source.description.value ??= "";
            source.description.value += `<h3>Circle${circleNumber}</h3><p><strong>unsolved migration objects:</strong></p><p> ${talent}</p>`;
          }
        } catch ( error ) {
          // If fromUuidSync fails, add to description for manual review
          source.description ??= {};
          source.description.value ??= "";
          source.description.value += `<h3>Circle${circleNumber}</h3><p><strong>unsolved migration objects:</strong></p><p> ${talent}</p>`;
        }
      }
      return validTalents;
    }

    /**
     * Parse talent links from description text.
     * @param {string} input   The input string containing talent links.
     * @returns {string[]}     Array of parsed talent UUIDs.
     */    
    function parseTalentLinks( input ) {
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

    return source;
  }
}