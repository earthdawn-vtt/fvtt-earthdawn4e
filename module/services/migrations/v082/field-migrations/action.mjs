import BaseMigration from "../../common/base-migration.mjs";

export default class ActionMigration extends BaseMigration {

  static migrateEarthdawnData( source, migrationId = "" ) {
    // Migrate action field in system data
    if ( source.system?.action && typeof source.system.action === "string" ) {
      source.system.action = source.system.action.slugify( { lowercase: true, strict: true } );
    }
  }
}