import BaseMigration from "../../../common/base-migration.mjs";

export default class NoneCharacterMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {

    if ( source.system?.actorType ) source.type = source.system.actorType;

    return source;
  }
}