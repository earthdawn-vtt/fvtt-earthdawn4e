export default class PriceMigration {

  static async migrateData( source ) {
    if ( source.cost ) {
    // Ensure price object exists
      source.price ??= {};
      // Assign cost to price.value
      source.price.value = source.cost;
    }
  }
}