export default class WeightMigration {

  static async migrateData( source ) {
    if ( typeof source.weight !== "object" ) {
    // Ensure price object exists
      
      const weight = source.weight ?? 0;
      console.log ( "weight log ", weight );
      source.weight = {
        value: Number( weight )
      };
      console.log ( "weight log 2 ", source.weight );
    }
  }
}