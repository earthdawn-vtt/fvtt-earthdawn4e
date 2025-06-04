export default class DescriptionMigration {

  static async migrateData( source ) {
  
    if ( typeof source.description === "string" ) {
      source.description = { value: source.description };
    }
  }
}