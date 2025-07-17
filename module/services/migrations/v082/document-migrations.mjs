import MigrationManager from "../../migration-manager.mjs";

// Import field-level migration classes
import { ActionMigration, AttributeMigration, DescriptionMigration, DifficultyMigration, LevelMigration, TierMigration, AvailabilityMigration, PriceMigration, WeightMigration, UsableItemMigration } from "./field-migrations/_module.mjs";

// Import document-type-specific migration classes
import * as documentTypeMigrations from "./document-type-migrations/_module.mjs";

/**
 * Migration handler for earthdawn4e legacy system documents to current ed4e system
 * This handles migrations from the old earthdawn4e system (v0.8.2 era)
 * @param {object} source - The source Item data from earthdawn4e legacy
 * @param {string} sourceSystem - The source system identifier (should be "earthdawn4e-legacy")
 * @returns {object} - The migrated Item data
 */
function migrateV082Item( source, sourceSystem ) {
  // Create working copy
  const migrated = foundry.utils.deepClone( source );

  // Handle old .data structure from earthdawn4e legacy (Foundry v9/v10)
  if ( source.data && !source.system ) {
    migrated.system = source.data;
    delete migrated.data;
  }

  // Apply common field migrations first
  applyCommonFieldMigrations( migrated );

  // Apply document-type-specific migrations
  applyDocumentTypeMigrations( migrated );

  // Type-specific system data migrations are handled by document-type-specific migrations
  // The document-type migrations (like KnackMigration, PowerMigration, etc.) handle:
  // - Type transformations (knack → knackAbility/knackKarma/etc.)
  // - System data structure changes
  // - Complex logic based on item properties
  
  // No additional type-specific migrations needed here since document-type migrations handle everything

  // Add system identifier to prevent re-migration
  migrated.system.migrationSource = sourceSystem;
  migrated.system.edVersion = game.system.version;

  return migrated;
}

/**
 * Migration handler for earthdawn4e legacy system Actor documents to current ed4e system
 * @param {object} source - The source Actor data from earthdawn4e legacy
 * @param {string} sourceSystem - The source system identifier (should be "earthdawn4e-legacy")
 * @returns {object} - The migrated Actor data
 */
function migrateV082Actor( source, sourceSystem ) {
  // Create working copy
  const migrated = foundry.utils.deepClone( source );

  // Handle old .data structure from earthdawn4e legacy (Foundry v9/v10)
  if ( source.data && !source.system ) {
    migrated.system = source.data;
    delete migrated.data;
  }

  // Apply actor-type-specific migrations
  applyActorTypeMigrations( migrated );

  // Add system identifier to prevent re-migration
  migrated.system.migrationSource = sourceSystem;
  migrated.system.edVersion = game.system.version;

  return migrated;
}

/**
 * Apply common field migrations to all item types
 * @param {object} source - The full source item document
 * @returns {object} - The source with migrated fields
 */
function applyCommonFieldMigrations( source ) {
  // Apply field-level migrations
  ActionMigration.migrateEarthdawnData( source );
  AttributeMigration.migrateEarthdawnData( source );
  DescriptionMigration.migrateEarthdawnData( source );
  DifficultyMigration.migrateEarthdawnData( source );
  LevelMigration.migrateEarthdawnData( source );
  TierMigration.migrateEarthdawnData( source );
  AvailabilityMigration.migrateEarthdawnData( source );
  PriceMigration.migrateEarthdawnData( source );
  WeightMigration.migrateEarthdawnData( source );
  UsableItemMigration.migrateEarthdawnData( source );
  
  return source;
}

/**
 * Apply document-type-specific migrations
 * @param {object} source - The full source item document
 * @returns {object} - The source with migrated document
 */
function applyDocumentTypeMigrations( source ) {
  const itemType = source.type?.toLowerCase();
  
  // Debug: Log the item being processed
  console.log( `[MigrationManager] Processing item type: "${itemType}" (original: "${source.type}") - Item: "${source.name}"` );
  
  // Map item types to their migration classes
  const itemMigrationMap = {
    armor:          documentTypeMigrations.item.ArmorMigration,
    devotion:       documentTypeMigrations.item.DevotionMigration,
    discipline:     documentTypeMigrations.item.DisciplineMigration,
    equipment:      documentTypeMigrations.item.EquipmentMigration,
    knack:          documentTypeMigrations.item.KnackMigration,
    // Handle transformed knack types - they still need knack migration for other transformations
    knackAbility:   documentTypeMigrations.item.KnackMigration,
    knackKarma:     documentTypeMigrations.item.KnackMigration,
    knackManeuver:  documentTypeMigrations.item.KnackMigration,
    spellKnack:     documentTypeMigrations.item.KnackMigration,
    mask:           documentTypeMigrations.item.MaskMigration,
    spellmatrix:    documentTypeMigrations.item.MatrixMigration,
    namegiver:      documentTypeMigrations.item.NamegiverMigration,
    power:          documentTypeMigrations.item.PowerMigration,
    shield:         documentTypeMigrations.item.ShieldMigration,
    skill:          documentTypeMigrations.item.SkillMigration,
    spell:          documentTypeMigrations.item.SpellMigration,
    talent:         documentTypeMigrations.item.TalentMigration,
    weapon:         documentTypeMigrations.item.WeaponMigration,
  };
  
  // Apply the appropriate migration class if it exists
  const migrationClass = itemMigrationMap[itemType];
  if ( migrationClass ) {
    console.log( `[MigrationManager] Found migration class for ${itemType}, executing...` );
    migrationClass.migrateEarthdawnData( source );
  } else {
    console.log( `[MigrationManager] No migration class found for item type: "${itemType}"` );
  }
  
  return source;
}

/**
 * Apply actor-type-specific migrations
 * @param {object} source - The full source actor document
 * @returns {object} - The source with migrated document
 */
function applyActorTypeMigrations( source ) {
  const actorType = source.type?.toLowerCase();
  
  // Map actor types to their migration classes (from the actor migration config)
  const actorMigrationMap = documentTypeMigrations.actor.typeMigrationConfig;
  
  // Apply the appropriate migration class if it exists
  const migrationClass = actorMigrationMap[actorType];
  if ( migrationClass ) {
    migrationClass.migrateEarthdawnData( source );
  }
  
  return source;
}


// Import migration config for system version keys
import { systemV0_8_2 } from "../../../config/migrations.mjs";

// Register this migration handler with the MigrationManager
// Use config variable for legacy system migration key
MigrationManager.registerMigration( systemV0_8_2.legacySystemKey, "Item", migrateV082Item );
MigrationManager.registerMigration( systemV0_8_2.legacySystemKey, "Actor", migrateV082Actor );

export { migrateV082Item, migrateV082Actor };
