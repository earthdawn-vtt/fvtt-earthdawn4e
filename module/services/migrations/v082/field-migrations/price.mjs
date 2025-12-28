import BaseMigration from "../../common/base-migration.mjs";

export default class PriceMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {
    if ( source.system?.cost ) {
    // Ensure price object exists
      source.system.price ??= {};
      // Assign cost to price.value
      source.system.price.value = source.system.cost;
    }
  }
}