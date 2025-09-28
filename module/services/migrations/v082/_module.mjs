/**
 * V0.8.2 Migration Module
 * Coordinates all migrations from earthdawn4e legacy system (v0.8.2) to current ed4e system
 */

import * as documentTypeMigrations from "./document-type-migrations/_module.mjs";
import * as fieldMigrations from "./field-migrations/_module.mjs";


export {
  documentTypeMigrations,
  fieldMigrations,
};