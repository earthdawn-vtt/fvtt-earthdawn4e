export default class WeightMigration {
  static async migrateData( source ) {
    if ( typeof source.weight !== "object" ) {
    // Ensure weight object exists
      
      const rawWeight = source.weight ?? 0;
      console.log ( "Weight§", rawWeight );
      
      // Convert weight to a finite number, handling edge cases
      let weightValue = 0;
      if ( typeof rawWeight === "number" && Number.isFinite( rawWeight ) ) {
        weightValue = rawWeight;
      } else if ( typeof rawWeight === "string" ) {
        // Handle comma as decimal separator (e.g., "0,5" -> "0.5")
        const normalizedWeight = rawWeight.replace( /,/g, "." );
        const parsed = parseFloat( normalizedWeight );
        if ( Number.isFinite( parsed ) && parsed >= 0 ) {
          weightValue = parsed;
        }
      }
      
      source.weight = {
        value: weightValue
      };
    }
  }
}