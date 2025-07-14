export default class ActionMigration {

  static migrateEarthdawnData( source, migrationId = "" ) {
    // Migrate action field in system data
    if ( source.system?.action && typeof source.system.action === "string" ) {
      source.system.action = source.system.action.slugify( { lowercase: true, strict: true } );
    }
  }
}