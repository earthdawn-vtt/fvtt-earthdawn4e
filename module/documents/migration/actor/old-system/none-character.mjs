export default class NoneCharacterMigration {

  static async migrateData( source ) {

    if ( source.system?.actorType ) source.type = source.system.actorType;

    return source;
  }
}