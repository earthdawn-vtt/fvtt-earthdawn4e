export default class LevelMigration {

  static async migrateData( source ) {
  
    if ( !source.level && !source.ranks ) {
      // No level or ranks defined, nothing to migrate
      return;
    }
    // Migrate action
    source.level ??= source.ranks;
  }
}