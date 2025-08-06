import BaseMigration from "../../common/base-migration.mjs";

export default class DescriptionMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {
  
    if ( source.system?.description && typeof source.system.description === "string" ) {
      source.system.description = { value: source.system.description };
    }
  }
}