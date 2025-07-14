export default class CharacterMigration {

  static async migrateEarthdawnData( source ) {
    source.type = "character";
  
    return source;
  }
}