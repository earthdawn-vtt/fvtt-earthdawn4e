export default class LevelMigration {

  static async migrateData( source ) {
  
    // Migrate action
    source.level ??= source.ranks;
  }
}