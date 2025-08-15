// Import migration config for system version keys
import { systemV0_8_2 } from "../../../config/migrations.mjs";
import TypeTransformationManager from "../type-transformation-manager.mjs";

/**
 * Type transformations for earthdawn4e legacy system (v0.8.2) to ed4e
 * This module handles all type transformations from the old earthdawn4e system (v0.8.2 era)
 * to the current ed4e system structure.
 */

/**
 * Register all earthdawn4e-legacy type transformations with the TypeTransformationManager
 * @param {object} typeTransformationManager - The TypeTransformationManager class to register with
 */
export function registerV082TypeTransformations( typeTransformationManager ) {
  const sourceSystem = systemV0_8_2.legacySystemKey;
  // ITEM TYPE TRANSFORMATIONS - Direct mappings
  typeTransformationManager.registerTypeTransform( sourceSystem, "armor", "armor" );
  typeTransformationManager.registerTypeTransform( sourceSystem, "devotion", "devotion" );
  typeTransformationManager.registerTypeTransform( sourceSystem, "equipment", "equipment" );
  typeTransformationManager.registerTypeTransform( sourceSystem, "mask", "mask" );
  typeTransformationManager.registerTypeTransform( sourceSystem, "namegiver", "namegiver" );
  typeTransformationManager.registerTypeTransform( sourceSystem, "shield", "shield" );
  typeTransformationManager.registerTypeTransform( sourceSystem, "skill", "skill" );
  typeTransformationManager.registerTypeTransform( sourceSystem, "spell", "spell" );
  typeTransformationManager.registerTypeTransform( sourceSystem, "talent", "talent" );
  typeTransformationManager.registerTypeTransform( sourceSystem, "weapon", "weapon" );
  
  // Legacy items with complex transformations (handled by document-type migrations)
  // spellmatrix and knack have complex type transformations based on their properties
  // These are handled by MatrixMigration and KnackMigration in document-type-migrations
  
  // ACTOR TYPE TRANSFORMATIONS - Direct mappings
  typeTransformationManager.registerTypeTransform( sourceSystem, "pc", "character" );

  // Register complex type transformation handler
  typeTransformationManager.registerComplexTypeTransform( sourceSystem, transformV082ComplexTypes );
}

/**
 * Handle complex type transformations for earthdawn4e-legacy documents
 * @param {object} source - The source document data (will be modified)
 * @returns {boolean} - True if type was transformed, false otherwise
 */
export function transformV082ComplexTypes( source ) {
  if ( !source.type || !source.system ) {
    return false;
  }

  const originalType = source.type;
  const newType = getComplexTransformedType( originalType, source.system );

  // Apply the transformation if we found a new type
  if ( newType && newType !== originalType ) {
    source.type = newType;
    
    // Track transformed documents for later fixing
    if ( source._id ) {
      // Determine document type and track it
      const documentType = determineDocumentTypeForTracking( originalType, newType );
      console.log ( "old and new type", originalType, newType );
      if ( documentType ) {
        TypeTransformationManager.addTransformedDocumentId( documentType, source._id );
      }
    }
    
    return true;
  }

  return false;
}

/**
 * Determine the document type for tracking based on original and new types
 * @param {string} originalType - The original type
 * @param {string} newType - The transformed type
 * @returns {string|null} - The document type ("actors" or "items") or null
 * @private
 */
function determineDocumentTypeForTracking( originalType, newType ) {
  // Actor types
  const actorTypes = [ "pc", "character", "creature", "npc", "dragon", "horror", "spirit", "trap" ];
  
  // Item types
  const itemTypes = [ 
    "armor", "devotion", "equipment", "mask", "namegiver", "shield", "skill", "spell", "talent", "weapon",
    "discipline", "path", "questor", "knackAbility", "knackKarma", "knackManeuver", "spellKnack",
    "maneuver", "power", "attack", "knack", "thread"
  ];
  
  if ( actorTypes.includes( originalType ) || actorTypes.includes( newType ) ) {
    return "actors";
  }
  
  if ( itemTypes.includes( originalType ) || itemTypes.includes( newType ) ) {
    return "items";
  }
  
  return null;
}

/**
 * Get the transformed type for complex transformations
 * @param {string} originalType - The original type
 * @param {object} systemData - The system data containing properties for transformation
 * @returns {string|null} - The new type or null if no transformation
 * @private
 */
function getComplexTransformedType( originalType, systemData ) {
  // Handle Item type transformations
  const itemType = transformItemType( originalType, systemData );
  if ( itemType ) return itemType;

  // Handle Actor type transformations
  const actorType = transformActorType( originalType, systemData );
  if ( actorType ) return actorType;

  return null;
}

/**
 * Transform Item types based on system properties
 * @param {string} originalType - The original type
 * @param {object} systemData - The system data
 * @returns {string|null} - The new type or null
 * @private
 */
function transformItemType( originalType, systemData ) {
  switch ( originalType ) {
    case "discipline":
      return transformDisciplineType( systemData.discipline );
    case "knack":
      return transformKnackType( systemData.knackType );
    case "attack":
      return transformAttackType( systemData.powerType );
    case "thread":
      return transformThreadType( systemData );
    // Note: reputation items need document-level transformation (Item→Actor)
    // This is handled in the migration system, not here
    default:
      return null;
  }
}

/**
 * Transform Actor types based on system properties
 * @param {string} originalType - The original type
 * @param {object} systemData - The system data
 * @returns {string|null} - The new type or null
 * @private
 */
function transformActorType( originalType, systemData ) {
  switch ( originalType ) {
    case "creature":
    case "npc":
      return transformCreatureNpcType( originalType, systemData.actorType );
    default:
      return null;
  }
}

/**
 * Transform discipline type based on discipline property
 * @param {string} disciplineValue - The discipline system property value
 * @returns {string} - The transformed type
 * @private
 */
function transformDisciplineType( disciplineValue ) {
  switch ( disciplineValue ) {
    case "discipline": return "discipline";
    case "path": return "path";
    case "questor": return "questor";
    default: return "discipline"; // Default fallback
  }
}

/**
 * Transform knack type based on knackType property
 * @param {string} knackTypeValue - The knackType system property value
 * @returns {string} - The transformed type
 * @private
 */
function transformKnackType( knackTypeValue ) {
  switch ( knackTypeValue ) {
    case "knack": return "knackAbility";
    case "karma": return "knackKarma";
    case "maneuver": return "knackManeuver";
    case "spell": return "spellKnack";
    default: return "knackAbility"; // Default fallback
  }
}

/**
 * Transform attack type based on powerType property
 * @param {string} powerTypeValue - The powerType system property value
 * @returns {string} - The transformed type
 * @private
 */
function transformAttackType( powerTypeValue ) {
  switch ( powerTypeValue ) {
    case "maneuver": return "maneuver";
    case "attack":
    case "power": return "power";
    default: return "power"; // Default fallback
  }
}

/**
 * Transform creature/npc type based on actorType property
 * @param {string} originalType - The original type (creature or npc)
 * @param {string} actorTypeValue - The actorType system property value
 * @returns {string} - The transformed type
 * @private
 */
function transformCreatureNpcType( originalType, actorTypeValue ) {
  switch ( actorTypeValue ) {
    case "creature": return "creature";
    case "dragon": return "dragon";
    case "horror": return "horror";
    case "spirit": return "spirit";
    case "trap": return "trap";
    case "npc": return "npc";
    default: return originalType === "creature" ? "creature" : "npc"; // Default fallback
  }
}

/**
 * Transform thread type - not yet implemented
 * @param {object} systemData - The system data
 * @returns {string|null} - The transformed type or null if not implemented
 * @private
 */
function transformThreadType( systemData ) {
  // TODO: Thread transformation not yet implemented
  return null; // No transformation for now
}
