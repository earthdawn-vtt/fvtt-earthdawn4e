import BaseMigration from "../../../common/base-migration.mjs";

export default class CharacterMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {
    source.type = "character";
  
    return source;
  }
}