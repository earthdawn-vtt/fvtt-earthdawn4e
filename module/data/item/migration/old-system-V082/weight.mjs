export default class WeightMigration {
  static async migrateData( source ) {
    if ( typeof source.weight !== "object" ) {
      // Ensure weight object exists
      const rawWeight = source.weight ?? 0;
      
      // Convert weight to a finite number, handling edge cases
      const parsedWeight = typeof rawWeight === "string" || rawWeight instanceof String
        ? parseFloat( rawWeight.replace( ",", "." ) )
        : rawWeight;

      const weightValue = Number.isFinite( parsedWeight ) && parsedWeight >= 0
        ? parsedWeight
        : 0;
      
      source.weight = {
        value: weightValue
      };
    }
  }
}