export default class ActionMigration {

  static async migrateData( source ) {
  
    // Migrate action
    source.action = source.action?.slugify( { lowercase: true, strict: true } );
  }
}