export default class CharacterMigration {

  static async migrateData( source ) {
    source.type = "character";
  
    return source; // Return the modified data
  }
}