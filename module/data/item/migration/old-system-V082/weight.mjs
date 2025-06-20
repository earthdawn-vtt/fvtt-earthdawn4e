export default class WeightMigration {

  static async migrateData( source ) {
    if ( typeof source.weight !== "object" ) {
    // Ensure price object exists
      
      const weight = source.weight ?? 0;
      source.weight = {
        value: Number( weight )
      };
    }
  }
}