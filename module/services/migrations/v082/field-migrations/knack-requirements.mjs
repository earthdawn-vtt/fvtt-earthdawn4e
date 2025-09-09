import BaseMigration from "../../common/base-migration.mjs";

export default class RequirementsMigration extends BaseMigration {

  static migrateEarthdawnData( source, migrationId = "" ) {
    console.log ( "Knack Requirements Migration not done yet" );
    source.system.requirements = [];
  }
}