export default class DescriptionMigration {

  static async migrateEarthdawnData( source ) {
  
    if ( source.system?.description && typeof source.system.description === "string" ) {
      source.system.description = { value: source.system.description };
    }
  }
}