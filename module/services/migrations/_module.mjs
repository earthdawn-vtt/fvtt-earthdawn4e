import MigrationManager from "./migration-manager.mjs";
import TypeTransformationManager from "./type-transformation-manager.mjs";
import { initializeV082Migrations } from "./v082/_module.mjs";

// Import future migration modules here
// import { initializeV100Migrations } from "./v100/_module.mjs";


/**
 * Initialize the migration system
 * This should be called during system initialization
 */
export function initializeMigrations() {
  // Initialize version-specific migrations
  initializeV082Migrations( TypeTransformationManager );
  // initializeV100Migrations( TypeTransformationManager );  // Future versions
}

export { MigrationManager };
export { TypeTransformationManager };
