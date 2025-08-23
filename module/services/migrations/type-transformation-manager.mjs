/**
 * Type Transformation Manager for handling document type transformations during migrations.
 * This manager coordinates type transformations from various source systems to the current ed4e system.
 * 
 * It provides a registry-based approach where different transformation modules can register:
 * - Simple type transformations (1:1 mappings)
 * - Complex type transformations (logic-based)
 * 
 * This manager is called by the MigrationManager but handles all type transformation logic separately.
 */
export default class TypeTransformationManager {

  /**
   * Registry of simple type transformation rules for cross-system migrations
   * @type {Map<string, Map<string, string>>}
   * @private
   */
  static #typeTransformRegistry = new Map();

  /**
   * Registry of complex type transformation handlers for different source systems
   * @type {Map<string, Function>}
   * @private
   */
  static #complexTypeTransformRegistry = new Map();

  /**
   * Map to track transformed document IDs by document type
   * Structure: { actors: [id1, id2], items: [id3, id4] }
   * @type {Map<string, string[]>}
   * @private
   */
  static #transformedDocumentIds = new Map();

  /**
   * Get the array of transformed document IDs for a specific document type
   * @param {string} documentType - The document type (e.g., "actors", "items")
   * @returns {string[]} - Array of document IDs that were transformed
   */
  static getTransformedDocumentIds( documentType ) {
    return [ ...( this.#transformedDocumentIds.get( documentType ) || [] ) ]; // Return a copy
  }

  /**
   * Get all transformed document IDs grouped by type
   * @returns {object} - Object with document types as keys and ID arrays as values
   */
  static getAllTransformedDocumentIds() {
    const result = {};
    for ( const [ docType, ids ] of this.#transformedDocumentIds ) {
      result[docType] = [ ...ids ]; // Return copies
    }
    return result;
  }

  /**
   * Add a document ID to the transformed documents list
   * @param {string} documentType - The document type (e.g., "actors", "items")
   * @param {string} documentId - The document ID to track
   */
  static addTransformedDocumentId( documentType, documentId ) {
    if ( !documentId ) return;
    
    if ( !this.#transformedDocumentIds.has( documentType ) ) {
      this.#transformedDocumentIds.set( documentType, [] );
    }
    
    const ids = this.#transformedDocumentIds.get( documentType );
    if ( !ids.includes( documentId ) ) {
      ids.push( documentId );
    }
  }

  /**
   * Clear the transformed documents list for a specific type or all types
   * @param {string} [documentType] - Optional document type to clear. If not provided, clears all
   */
  static clearTransformedDocumentIds( documentType = null ) {
    if ( documentType ) {
      this.#transformedDocumentIds.delete( documentType );
    } else {
      this.#transformedDocumentIds.clear();
    }
  }

  /**
   * Legacy method for backward compatibility
   * @returns {string[]} - Array of actor IDs that were transformed
   * @deprecated Use getTransformedDocumentIds("actors") instead
   */
  static getTransformedActorIds() {
    return this.getTransformedDocumentIds( "actors" );
  }

  /**
   * Legacy method for backward compatibility
   * @param {string} actorId - The actor ID to track
   * @deprecated Use addTransformedDocumentId("actors", actorId) instead
   */
  static addTransformedActorId( actorId ) {
    this.addTransformedDocumentId( "actors", actorId );
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use clearTransformedDocumentIds("actors") instead
   */
  static clearTransformedActorIds() {
    this.clearTransformedDocumentIds( "actors" );
  }

  /**
   * Register a simple type transformation rule for migrations
   * @param {string} sourceSystem - The source system identifier
   * @param {string} sourceType - The original type in the source system
   * @param {string} targetType - The target type in the ed4e system
   */
  static registerTypeTransform( sourceSystem, sourceType, targetType ) {
    if ( !this.#typeTransformRegistry.has( sourceSystem ) ) {
      this.#typeTransformRegistry.set( sourceSystem, new Map() );
    }
    this.#typeTransformRegistry.get( sourceSystem ).set( sourceType, targetType );
  }

  /**
   * Register a complex type transformation handler for a source system
   * @param {string} sourceSystem - The source system identifier
   * @param {Function} transformHandler - The transformation function that takes (source) and returns boolean
   */
  static registerComplexTypeTransform( sourceSystem, transformHandler ) {
    this.#complexTypeTransformRegistry.set( sourceSystem, transformHandler );
  }

  /**
   * Transform document type if needed for migration (simple transformations)
   * @param {object} source - The source document data (will be modified)
   * @param {string} sourceSystem - The detected source system
   * @returns {boolean} - True if type was transformed, false otherwise
   */
  static transformType( source, sourceSystem ) {
    const transformMap = this.#typeTransformRegistry.get( sourceSystem );
    if ( !transformMap || !source.type ) {
      return false;
    }

    const slugifiedType = source.type.slugify( { strict: true, lowercase: true } );
    const targetType = transformMap.get( slugifiedType );
    if ( targetType && targetType !== source.type ) {

      console.log( `MigrationManager: Type Transforming "${source.name || "Name-Not-Found-in-available-data"}" type "${source.type}" → "${targetType}" for system "${sourceSystem}"` );

      const originalType = source.type;
      source.type = targetType;
      
      // Track transformed documents for later fixing
      if ( source._id ) {
        // Determine document type based on the collection or context
        const documentType = this.#determineDocumentType( source, originalType, targetType );
        if ( documentType ) {
          this.addTransformedDocumentId( documentType, source._id );
        }
      }
      
      return true;
    }

    return false;
  }

  /**
   * Determine the document type (actors/items) based on the source data
   * @param {object} source - The source document data
   * @param {string} originalType - The original type
   * @param {string} targetType - The target type
   * @returns {string|null} - The document type ("actors" or "items") or null if unknown
   * @private
   */
  static #determineDocumentType( source, originalType, targetType ) {
    // Actor types (both original and target)
    const actorTypes = [ "pc", "character", "creature", "npc", "dragon", "horror", "spirit", "trap", "vehicle" ];
    
    // Item types (both original and target)
    const itemTypes = [ 
      "armor", "devotion", "equipment", "mask", "namegiver", "shield", "skill", "spell", "talent", "weapon",
      "discipline", "path", "questor", "knackAbility", "knackKarma", "knackManeuver", "spellKnack",
      "maneuver", "power", "attack", "knack", "thread"
    ];
    
    if ( actorTypes.includes( originalType ) || actorTypes.includes( targetType ) ) {
      return "actors";
    }
    
    if ( itemTypes.includes( originalType ) || itemTypes.includes( targetType ) ) {
      return "items";
    }
    
    return null; // Unknown document type
  }

  /**
   * Transform document type using complex logic for cases where simple mapping isn't sufficient
   * @param {object} source - The source document data (will be modified)
   * @param {string} sourceSystem - The detected source system
   * @returns {boolean} - True if type was transformed, false otherwise
   */
  static transformComplexType( source, sourceSystem ) {
    const transformHandler = this.#complexTypeTransformRegistry.get( sourceSystem );
    
    if ( !transformHandler ) {
      return false; // No complex transformation handler for this source system
    }

    try {
      return transformHandler( source );
    } catch ( error ) {
      if ( game.settings.get( "ed4e", "debug" ) === true ) {
        console.error( `TypeTransformationManager: Error in complex type transformation for ${sourceSystem}:`, error );
      }
      return false;
    }
  }

  /**
   * Apply all type transformations for a source document
   * This method coordinates both simple and complex transformations
   * @param {object} source - The source document data (will be modified)
   * @param {string} sourceSystem - The detected source system
   * @returns {boolean} - True if any transformation was applied, false otherwise
   */
  static transformAllTypes( source, sourceSystem ) {
    // First try simple type transformations
    const simpleTransformed = this.transformType( source, sourceSystem );
    
    // Then try complex type transformations that depend on system properties
    const complexTransformed = this.transformComplexType( source, sourceSystem );
    
    return simpleTransformed || complexTransformed;
  }

  /**
   * Get debugging information about registered transformations
   * @returns {object} - Debug information
   */
  static getDebugInfo() {
    const transforms = {};
    for ( const [ system, transformMap ] of this.#typeTransformRegistry ) {
      transforms[ system ] = Object.fromEntries( transformMap );
    }

    const complexTransforms = Array.from( this.#complexTypeTransformRegistry.keys() );

    return {
      typeTransforms:              transforms,
      complexTypeTransformSystems: complexTransforms
    };
  }

  /**
   * Clear all registered transformations (mainly for testing)
   */
  static clearAll() {
    this.#typeTransformRegistry.clear();
    this.#complexTypeTransformRegistry.clear();
  }

  /**
   * General function to fix all transformed documents using ==system AND recursive: false
   * This ensures documents are properly validated in Foundry V13 after type transformations
   * @param {object} [documentIds] - Optional object with document type keys and ID arrays as values
   *                                      e.g., { actors: ["id1", "id2"], items: ["id3"] }
   *                                      If not provided, fixes all transformed documents
   */
  static async fixAllTransformedDocuments( documentIds = null ) {
    const documentsToFix = documentIds || this.getAllTransformedDocumentIds();

    // Fix actors
    if ( documentsToFix.actors && documentsToFix.actors.length > 0 ) {
      await this.#fixDocuments( "actors", documentsToFix.actors );
    }
    
    // Fix items
    if ( documentsToFix.items && documentsToFix.items.length > 0 ) {
      await this.#fixDocuments( "items", documentsToFix.items );
    }
  }

  /**
   * Internal helper to fix documents of a specific type
   * @param {string} documentType - The document type ("actors" or "items")
   * @param {string[]} documentIds - Array of document IDs to fix
   * @private
   */
  static async #fixDocuments( documentType, documentIds ) {
    if ( documentType === "actors" ) {
      const collection = game.actors;
      const documents = documentIds
        .map( id => collection.get( id ) )
        .filter( doc => doc );
      
      if ( documents.length === 0 ) return;
      
      for ( let i = 0; i < documents.length; i++ ) {
        const document = documents[i];
        try {
          const fullSystemData = foundry.utils.deepClone( document.system );
          
          await document.update( {
            type:       document.type,
            "==system": fullSystemData
          }, {
            recursive: false,
            diff:      false,
            render:    false,
            broadcast: false
          } );
        } catch ( error ) {
          console.log( `❌ Failed to fix ${document.name}:`, error.message );
        }
        
        await new Promise( resolve => {
          setTimeout( resolve, 50 );
        } );
      }
    } else if ( documentType === "items" ) {
      // Handle both top-level items AND embedded items
      const topLevelItems = documentIds
        .map( id => game.items.get( id ) )
        .filter( doc => doc );
      
      // Find embedded items in actors
      const embeddedItems = [];
      for ( const actor of game.actors ) {
        for ( const itemId of documentIds ) {
          const embeddedItem = actor.items.get( itemId );
          if ( embeddedItem ) {
            embeddedItems.push( embeddedItem );
          }
        }
      }
      
      // Fix top-level items
      for ( const item of topLevelItems ) {
        try {
          const fullSystemData = foundry.utils.deepClone( item.system );
          await item.update( {
            type:       item.type,
            "==system": fullSystemData
          }, {
            recursive: false,
            diff:      false,
            render:    false,
            broadcast: false
          } );
        } catch ( error ) {
          console.log( `❌ Failed to fix top-level item ${item.name}:`, error.message );
        }
        await new Promise( resolve => {
          setTimeout( resolve, 50 );
        } );
      }
      
      // Fix embedded items
      for ( const item of embeddedItems ) {
        try {
          const fullSystemData = foundry.utils.deepClone( item.system );
          await item.update( {
            type:       item.type,
            "==system": fullSystemData
          }, {
            recursive: false,
            diff:      false,
            render:    false,
            broadcast: false
          } );
        } catch ( error ) {
          console.log( `❌ Failed to fix embedded item ${item.name}:`, error.message );
        }
        await new Promise( resolve => {
          setTimeout( resolve, 50 );
        } );
      }
    }
  }

  /**
   * Function to fix character actors using ==system AND recursive: false
   * This ensures character actors are properly validated in Foundry V13
   * @param {string[]} actorIds - Optional array of specific actor IDs to fix. If not provided, fixes all character actors
   * @deprecated Use fixAllTransformedDocuments() for more comprehensive fixing
   */
  static async fixAllCharacterActors( actorIds = null ) {
    let characterActors;
    
    if ( actorIds && actorIds.length > 0 ) {
      // Fix only specific actors
      characterActors = actorIds
        .map( id => game.actors.get( id ) )
        .filter( actor => actor && actor.type === "character" );
    } else {
      // Fix all character actors
      characterActors = game.actors.filter( actor => actor.type === "character" );
    }
    
    // Loop through character actors
    for ( let i = 0; i < characterActors.length; i++ ) {
      const actor = characterActors[i];
      try {
        // Get the full system data
        const fullSystemData = foundry.utils.deepClone( actor.system );
        await actor.update( {
          type:       "character",
          "==system": fullSystemData
        }, {
          recursive: false,  // This is required for type changes
          diff:      false,
          render:    false,
          broadcast: false
        } );
        console.log( `✅ Fixed actor: ${actor.name}` );
      } catch ( error ) {
        console.log( `❌ Still failed for ${actor.name}:`, error.message );
        console.log( "This suggests the actor data is corrupted at database level." );
      }
      // Small delay between updates
      await new Promise( resolve => {
        setTimeout( resolve, 100 );
      } );
    }
  }
}
