export default class NoneCharacterMigration {

  static async migrateEarthdawnData( source ) {

    if ( source.system?.actorType ) source.type = source.system.actorType;

    return source;
  }
}