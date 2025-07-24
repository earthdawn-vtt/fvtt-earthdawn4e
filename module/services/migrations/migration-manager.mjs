// Import migration config for system version keys
import { systemV0_8_2 } from "../../config/migrations.mjs";
import TypeTransformationManager from "./type-transformation-manager.mjs";

/**
 * Central Migration Manager for handling all data migrations between different system versions.
 * This manager coordinates migrations from various systems to the current ed4e system.
 * 
 * The manager provides a registry-based approach where different migration modules can register:
 * - Document-specific migration handlers
 * 
 * Type transformations are handled by the separate TypeTransformationManager.
 * 
 * To add support for a new source system:
 * 1. Create a transformation module in /migrations/v###/ (see type-transformations.mjs)
 * 2. Register transformations in /migrations/_module.mjs
 * 3. Create migration handlers in /migrations/ if needed
 * 
 * This design keeps the core manager clean and allows for easy addition of new migration sources.
 */

export default class MigrationManager {

  /**
   * Registry of migration handlers for different source systems and versions
   * @type {Map<string, Map<string, Function>>}
   * @private
   */
  static #migrationRegistry = new Map();

  /**
   * Register a migration handler for a specific source system and version
   * @param {string} sourceSystem - The source system identifier (e.g., "earthdawn4e", "ed4e-v082")
   * @param {string} documentType - The document type (e.g., "Item", "Actor")
   * @param {Function} migrationHandler - The migration function
   */
  static registerMigration( sourceSystem, documentType, migrationHandler ) {
    if ( !this.#migrationRegistry.has( sourceSystem ) ) {
      this.#migrationRegistry.set( sourceSystem, new Map() );
    }
    this.#migrationRegistry.get( sourceSystem ).set( documentType, migrationHandler );
  }

  /**
   * Detect the source system and version from document data
   * @param {object} source - The source document data
   * @returns {string|null} - The detected source system identifier, or null if unrecognized
   */
  static detectSourceSystem( source ) {
    // Check if it already has migration markers
    if ( source.system?.migrationSource && source.system?.edVersion ) {
      // Version-aware check: only skip if it's already at current version
      if ( source.system.edVersion === game.system.version ) {
        return null; // Already at current version, no migration needed
      }
      // Has old version markers, might need version-to-version migration
      // For now, we only handle earthdawn4e-legacy → current
      // Future: add logic for ed4e v1.0 → v2.0 etc.
      return null; // Skip for now, no inter-version migrations implemented yet
    }

    // If it only has migrationSource but no edVersion, treat as already migrated
    if ( source.system?.migrationSource ) {
      return null; // Already migrated
    }

    // Check for old earthdawn4e v0.8.2 structure patterns
    if ( source.system && typeof source.system === "object" ) {
      // Check for old earthdawn4e Actor patterns
      if ( this.#isLegacyEarthdawn4eActor( source ) ) return systemV0_8_2.legacySystemKey;
      
      // Check for old earthdawn4e Item patterns  
      if ( this.#isLegacyEarthdawn4eItem( source ) ) return systemV0_8_2.legacySystemKey;
    }

    // Check for old Foundry .data structure (fallback)
    if ( source.data && typeof source.data === "object" && !source.system ) {
      return systemV0_8_2.legacySystemKey;
    }

    // Default to no migration needed
    return null;
  }

  /**
   * Check if source has old earthdawn4e Actor structure
   * @param {object} source - The source document data
   * @returns {boolean} - True if this looks like old earthdawn4e Actor data
   * @private
   */
  static #isLegacyEarthdawn4eActor( source ) {
    const sys = source.system;
    
    // Old earthdawn4e had flat attribute structure - check key indicators
    return sys?.dexterityvalue !== undefined || 
           sys?.strengthvalue !== undefined ||
           sys?.dexterityStep !== undefined ||
           sys?.strengthStep !== undefined;
  }

  /**
   * Check if source has old earthdawn4e Item structure
   * @param {object} source - The source document data  
   * @returns {boolean} - True if this looks like old earthdawn4e Item data
   * @private
   */
  static #isLegacyEarthdawn4eItem( source ) {
    // Old earthdawn4e never had edid - absence indicates legacy (if has system data)
    return source.system.edid === undefined;
  }

  /**
   * Main migration method that handles the complete migration flow
   * @param {object} source - The source document data
   * @param {string} documentClass - The document class name ("Item", "Actor", etc.)
   * @returns {object} - The migrated document data
   */
  static migrateDocument( source, documentClass ) {
    // First, detect the source system
    const sourceSystem = this.detectSourceSystem( source );
    
    if ( !sourceSystem ) {

      // console.warn( "MigrationManager: Could not detect source system, skipping migration" );

      return source;
    }


    console.log( `MigrationManager: Migrating ${documentClass} "${source.name || "Name-Not-Found-in-available-data"}" from "${sourceSystem}"` );


    // Create a working copy
    const workingSource = foundry.utils.deepClone( source );

    // Step 1: Apply Foundry's core migration first
    // Note: This should be called by the document class using super.migrateData()
    
    // Step 2: Apply type transformations (delegated to TypeTransformationManager)
    TypeTransformationManager.transformAllTypes( workingSource, sourceSystem );
    
    // Step 3: Apply system-specific migrations
    const migrationHandler = this.#migrationRegistry.get( sourceSystem )?.get( documentClass );
    if ( migrationHandler ) {
      try {
        const migrationResult = migrationHandler( workingSource, sourceSystem );
        
        // Handle different return patterns from migration functions
        if ( migrationResult && typeof migrationResult === "object" ) {
          // Migration returned a new object
          return migrationResult;
        } else {
          // Migration modified in-place or returned nothing
          return workingSource;
        }
      } catch ( error ) {
        console.error( `MigrationManager: Error during ${sourceSystem} → ed4e migration of ${documentClass} "${source.name || "Unnamed"}":`, error );
        return workingSource;
      }
    } else {
      console.log( `MigrationManager: No migration handler found for ${sourceSystem}/${documentClass}` );
      return workingSource;
    }
  }

  /**
   * Get debugging information about registered migrations
   * @returns {object} - Debug information
   */
  static getDebugInfo() {
    const systems = Array.from( this.#migrationRegistry.keys() );
    const types = {};
    
    for ( const [ system, handlers ] of this.#migrationRegistry ) {
      types[ system ] = Array.from( handlers.keys() );
    }

    // Get type transformation info from TypeTransformationManager
    const typeTransformInfo = TypeTransformationManager.getDebugInfo();

    return {
      registeredSystems: systems,
      registeredTypes:   types,
      ...typeTransformInfo
    };
  }
}
