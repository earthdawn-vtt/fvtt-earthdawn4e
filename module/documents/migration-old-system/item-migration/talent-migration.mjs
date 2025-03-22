/* eslint-disable complexity */

import ActionMigration from "../migration-partials/action-migration.mjs";
import EdIdMigration from "../migration-partials/ed-id-migration.mjs";
import MagicSettingMigration from "../migration-partials/magic-setting-migration.mjs";

export default class TalentMigration {
    
  static async migrateData( source ) {

    ActionMigration.migrateData( source );

    MagicSettingMigration.migrateData( source );

    EdIdMigration.migrateData( source );

    return source; // Return the modified data
  }
}