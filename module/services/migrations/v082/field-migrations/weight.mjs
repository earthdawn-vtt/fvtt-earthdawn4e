export default class WeightMigration {
  static async migrateEarthdawnData( source ) {
    if ( source.system && typeof source.system.weight !== "object" ) {
      // Ensure weight object exists
      const rawWeight = source.system.weight ?? 0;
      
      // Convert weight to a finite number, handling edge cases
      const parsedWeight = typeof rawWeight === "string" || rawWeight instanceof String
        ? parseFloat( rawWeight.replace( ",", "." ) )
        : rawWeight;

      const weightValue = Number.isFinite( parsedWeight ) && parsedWeight >= 0
        ? parsedWeight
        : 0;
      
      source.system.weight = {
        value: weightValue
      };
    }
  }
}