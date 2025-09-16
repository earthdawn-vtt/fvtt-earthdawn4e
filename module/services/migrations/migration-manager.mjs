// Import migration config for system version keys
import { systemV0_8_2 } from "../../config/migrations.mjs";
import TypeTransformationManager from "./type-transformation-manager.mjs";
import BaseMigration from "./common/base-migration.mjs";

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
    // Check if it already has migration markers in flags or system
    // First check flags - more reliable because they're preserved during import
    if ( source.flags?.ed4e?.migratedVersion ) {
      // Version-aware check: only skip if it's already at current version
      if ( source.flags.ed4e.migratedVersion === game.system.version ) {
        return null; // Already at current version, no migration needed
      }
      // Otherwise, it has an old version marker, might need version-to-version migration
      // For now, we only handle earthdawn4e-legacy → current
      // Future: add logic for ed4e v1.0 → v2.0 etc.
      return null; // Skip for now, no inter-version migrations implemented yet
    }
    
    // Legacy check for old migration markers in system
    if ( source.system?.migrationSource && source.system?.edVersion ) {
      // Version-aware check: only skip if it's already at current version
      if ( source.system.edVersion === game.system.version ) {
        return null; // Already at current version, no migration needed
      }
      // Has old version markers, might need version-to-version migration
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


    // console.log( `MigrationManager: Migrating ${documentClass} "${source.name || "Name-Not-Found-in-available-data"}" from "${sourceSystem}"` );


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
  
  /**
   * Finalize all migrations and log a summary of the results
   * This should be called after all migrations are complete
   * @param {boolean} createJournal - Whether to create a journal entry with the migration results
   * @returns {Promise<object>} Migration statistics and created journal entry including successful migrations, 
   *                            incomplete migrations, total count, and journal reference if created
   */
  static async finalizeMigrations( createJournal = true ) {
    // Log a comprehensive summary of all migrations
    console.group( "Migration Summary" );
    
    // Get migration statistics from BaseMigration
    const successful = BaseMigration.getSuccessfulMigrations();
    const incomplete = BaseMigration.getIncompleteMigrations();
    const total = successful.length + incomplete.length;
    
    // Log overall statistics
    console.log( `Total migrations processed: ${total}` );
    console.log( `Successful migrations: ${successful.length}` );
    console.log( `Incomplete migrations: ${incomplete.length}` );
    
    // Log details about successful migrations
    if ( successful.length > 0 ) {
      console.group( "Successfully migrated items:" );
      successful.forEach( item => {
        console.log( `${item.name} (${item.type}): ${item.uuid || "No UUID"}` );
      } );
      console.groupEnd();
    }
    
    // Log details about incomplete migrations
    if ( incomplete.length > 0 ) {
      console.group( "Incompletely migrated items:" );
      incomplete.forEach( item => {
        console.log( `${item.name} (${item.type}): ${item.uuid || "No UUID"} - Reason: ${item.reason || "Unknown"}` );
      } );
      console.groupEnd();
    }
    
    console.groupEnd();
    
    // Create a journal entry with the migration results if requested
    let journal = null;
    if ( createJournal && game.user.isGM && total > 0 ) {
      journal = await this.#createMigrationJournal( successful, incomplete );
    }
    
    // Persist all migrated documents to the database
    if ( total > 0 && game.user.isGM ) {
      await this.persistMigratedDocuments( true );
    }
    
    return {
      successful,
      incomplete,
      total,
      journal
    };
  }
  
  /**
   * Create a journal entry with migration results
   * @param {Array} successful - List of successful migrations
   * @param {Array} incomplete - List of incomplete migrations
   * @returns {Promise<JournalEntry>} The created journal entry
   * @private
   */
  /**
   * Helper method for organizing migrations by their type
   * @param {Array} migrations - Array of migration objects to be grouped by their type property
   * @returns {object} Object with types as keys and arrays of migrations as values
   * @private
   */
  static #groupByType( migrations ) {
    return migrations.reduce( ( acc, migration ) => {
      const type = migration.type || "unknown";
      if ( !acc[type] ) {
        acc[type] = [];
      }
      acc[type].push( migration );
      return acc;
    }, {} );
  }

  /**
   * Try to find an item in the world by UUID or ID, even if embedded in an actor
   * @param {object} itemData - The item data with potential UUID and ID
   * @returns {Promise<string|null>} - Valid UUID or null if not found
   * @private
   */
  static async #tryFindItemInWorld( itemData ) {
    // If no UUID is provided, we can't look it up directly
    if ( !itemData.uuid && !itemData.id ) return null;
    
    // First try the direct UUID if it exists
    if ( itemData.uuid ) {
      try {
        const item = await fromUuid( itemData.uuid );
        if ( item ) return itemData.uuid;
      } catch ( e ) {
        // UUID not valid, we'll try other methods
        console.debug( `Invalid UUID ${itemData.uuid} for item ${itemData.name}, searching by ID` );
      }
    }
    
    // Extract the ID from either the UUID or use the explicit ID
    let itemId = null;
    if ( itemData.uuid ) {
      const uuidMatch = itemData.uuid.match( /^Item\.([a-zA-Z0-9]+)$/ );
      if ( uuidMatch && uuidMatch[1] ) {
        itemId = uuidMatch[1];
      }
    }
    
    // If we couldn't extract ID from UUID, use the explicit ID
    if ( !itemId && itemData.id ) {
      itemId = itemData.id;
    }
    
    // If we still don't have an ID, we can't proceed
    if ( !itemId ) return null;
    
    // First check if it exists directly in the world items
    const worldItem = game.items.get( itemId );
    if ( worldItem ) {
      return worldItem.uuid;
    }
    
    // If not found in world items, look through all actors for embedded items
    for ( const actor of game.actors ) {
      const embeddedItem = actor.items.find( i => i.id === itemId );
      if ( embeddedItem ) {
        return embeddedItem.uuid; // Return the proper Actor.X.Item.Y format UUID
      }
    }
    
    // Item not found anywhere in the world
    return null;
  }

  /**
   * Persist all migrated documents to the database to ensure changes are saved
   * This forces an update of all items in the world, applying the migration changes
   * @param {boolean} [interactive=true] - Whether to show UI notifications and progress
   * @returns {Promise<object>} Stats about the persistence operation
   */
  /**
   * Persist all migrated documents to the database to ensure changes are saved
   * This forces an update of all items and actors in the world, applying the migration changes
   * @param {boolean} [interactive=true] - Whether to show UI notifications and progress
   * @returns {Promise<object>} Stats about the persistence operation
   */
  static async persistMigratedDocuments( interactive = true ) {
    const stats = { items: 0, actors: 0, errors: 0, scenes: 0 };
    
    if ( interactive ) {
      ui.notifications.info( game.i18n.localize( "ED.Migration.StartingPersistProcess" ) );
    }
    
    try {
      // Get all documents to process
      const items = game.items.contents;
      const actors = game.actors.contents;
      
      // Process all items in the world
      for ( const item of items ) {
        try {
          // Get existing flags to preserve them
          const existingFlags = foundry.utils.deepClone(item.flags || {});
          
          // Ensure ed4e namespace exists
          if (!existingFlags.ed4e) existingFlags.ed4e = {};
          
          // Add migration version without overwriting other flags
          existingFlags.ed4e.migratedVersion = game.system.version;
          
          // Update system data and restore all flags
          await item.update({
            "==system": item.system.toObject(),
            "flags": existingFlags
          }, {
            diff: false,
            recursive: false,
            noHook: false // We want hooks to fire for proper updating
          });
          
          stats.items++;
        } catch ( error ) {
          console.error( `Failed to persist migrated item ${item.name}:`, error );
          stats.errors++;
        }
      }
      
      // Process all actors in the world
      for ( const actor of actors ) {
        try {
          // Get existing flags to preserve them
          const existingFlags = foundry.utils.deepClone(actor.flags || {});
          
          // Ensure ed4e namespace exists
          if (!existingFlags.ed4e) existingFlags.ed4e = {};
          
          // Add migration version without overwriting other flags
          existingFlags.ed4e.migratedVersion = game.system.version;
          
          // Update system data and restore all flags
          await actor.update({
            "==system": actor.system.toObject(),
            "flags": existingFlags
          }, {
            diff: false,
            recursive: false,
            noHook: false
          });
          
          // Also update embedded items within actors
          if (actor.items?.size > 0) {
            const embeddedUpdates = [];
            
            // Handle each embedded item
            for (const embeddedItem of actor.items) {
              // Get existing flags from the embedded item
              const existingItemFlags = foundry.utils.deepClone(embeddedItem.flags || {});
              
              // Ensure ed4e namespace exists
              if (!existingItemFlags.ed4e) existingItemFlags.ed4e = {};
              
              // Add migration version without overwriting other flags
              existingItemFlags.ed4e.migratedVersion = game.system.version;
              
              // Create update with preserved flags
              embeddedUpdates.push({
                _id: embeddedItem.id,
                "==system": embeddedItem.system.toObject(),
                "flags": existingItemFlags
              });
            }
            
            // Apply updates if we have any
            if (embeddedUpdates.length > 0) {
              await actor.updateEmbeddedDocuments("Item", embeddedUpdates);
            }
          }
          
          stats.actors++;
        } catch ( error ) {
          console.error( `Failed to persist migrated actor ${actor.name}:`, error );
          stats.errors++;
        }
      }
      
      // Process tokens in scenes if needed (for unlinked tokens)
      for ( const scene of game.scenes ) {
        let updated = false;
        const tokenUpdates = [];
        
        for ( const token of scene.tokens ) {
          if ( token.actorData ) { // Only process unlinked tokens with actor data
            tokenUpdates.push( {
              _id: token.id,
              actorData: foundry.utils.deepClone( token.actorData )
            } );
            updated = true;
          }
        }
        
        if ( updated && tokenUpdates.length > 0 ) {
          await scene.updateEmbeddedDocuments( "Token", tokenUpdates );
          stats.scenes++;
        }
      }
      
    } finally {
      if ( interactive ) {
        ui.notifications.info( game.i18n.localize( "ED.Migration.PersistComplete" ) );
      }
    }
    
    console.log("Migration persistence complete:", stats);
    return stats;
  }
  
  static async #createMigrationJournal( successful, incomplete ) {
    try {
      const timestamp = new Date().toLocaleString();
      const journalName = `Migration Results - ${timestamp}`;
      
      // Prepare ownership - default is NONE, GMs get OWNER access
      const ownership = { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE };
      
      // Add ownership for all GM users
      game.users.filter( u => u.isGM ).forEach( gmUser => {
        ownership[gmUser.id] = CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
      } );
      
      // Generate HTML content for the journal
      let content = "<h1>Migration Results</h1>";
      
      // Summary section
      content += "<h2>Summary</h2><ul>" +
        `<li><strong>Timestamp:</strong> ${timestamp}</li>` +
        `<li><strong>Total migrations:</strong> ${successful.length + incomplete.length}</li>` +
        `<li><strong>Successful migrations:</strong> ${successful.length}</li>` +
        `<li><strong>Incomplete migrations:</strong> ${incomplete.length}</li>` +
        "</ul>";
      
      // Successful migrations section
      if ( successful.length > 0 ) {
        content += "<h2>Successful Migrations</h2>";
        
        // Group by type
        const groupedSuccessful = this.#groupByType( successful );
        
        for ( const [ type, items ] of Object.entries( groupedSuccessful ) ) {
          const typeTitle = type.charAt( 0 ).toUpperCase() + type.slice( 1 );
          content += `<h3>${typeTitle} (${items.length})</h3><ol>`;
          
          for ( const item of items ) {
            const validUuid = await this.#tryFindItemInWorld( item );
            if ( validUuid ) {
              content += `<li>@UUID[${validUuid}]{${item.name}} (${item.type})</li>`;
            } else {
              content += `<li>${item.name} (${item.type}) - <code>Not found in world</code></li>`;
            }
          }
          
          content += "</ol>";
        }
      }
      
      // Incomplete migrations section
      if ( incomplete.length > 0 ) {
        content += "<h2>Incomplete Migrations</h2>";
        content += "<p>The following items had issues during migration:</p><ol>";
        
        for ( const item of incomplete ) {
          content += "<li>";
          
          // Item name with UUID link if available
          const validUuid = await this.#tryFindItemInWorld( item );
          if ( validUuid ) {
            content += `@UUID[${validUuid}]{${item.name}} (${item.type})<br>`;
          } else {
            content += `<strong>${item.name} (${item.type})</strong><br>`;
          }
          
          // Error reason
          content += `<span style="color: #d32f2f;">${item.reason || "Unknown reason"}</span>`;
          
          content += "</li>";
        }
        
        content += "</ol>";
      }
      
      // Create journal pages data
      const pages = [ {
        name:  "Migration Results",
        type:  "text",
        text:  {
          content:  content,
          format:   CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML
        }
      } ];
      
      // Create the journal entry
      const journalEntry = await JournalEntry.create( {
        name:       journalName,
        pages:      pages,
        ownership:  ownership
      } );
      
      // Render the journal sheet
      if ( journalEntry ) {
        journalEntry.sheet.render( true );
      }
      
      return journalEntry;
      
    } catch ( error ) {
      console.error( "Failed to create migration journal:", error );
      ui.notifications.error( `Failed to create migration journal: ${error.message}` );
      return null;
    }
  }
}
