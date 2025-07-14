/**
 * V0.8.2 Migration Module
 * Coordinates all migrations from earthdawn4e legacy system (v0.8.2) to current ed4e system
 */

import { registerV082TypeTransformations } from "./type-transformations.mjs";
import "./document-migrations.mjs"; // Auto-registers with MigrationManager

/**
 * Initialize all v0.8.2 migration components
 * @param {object} typeTransformationManager - The TypeTransformationManager instance
 */
export function initializeV082Migrations( typeTransformationManager ) {
  // Register type transformations
  registerV082TypeTransformations( typeTransformationManager );
}
