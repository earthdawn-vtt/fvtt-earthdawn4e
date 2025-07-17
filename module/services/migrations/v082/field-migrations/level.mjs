import BaseMigration from "../../common/base-migration.mjs";

export default class LevelMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {
  
    if ( source.system && !source.system.level && !source.system.ranks ) {
      // No level or ranks defined, nothing to migrate
      return;
    }
    // Migrate level from ranks if needed
    if ( source.system ) {
      source.system.level ??= source.system.ranks;
    }
  }
}