import BaseMigration from "../../common/base-migration.mjs";

export default class PriceMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {
    if ( source.system?.cost ) {
    // Ensure price object exists
      source.system.price ??= {};
      // Assign cost to price.value

      if ( typeof source.system.cost === "string" ) {

        // Set denomination to copper if original value started with 0
        if ( source.system.cost.startsWith( "0" ) ) {
          source.system.price.denomination = "copper";
        }

        // Remove leading 0s and any . or , characters
        source.system.cost = source.system.cost.replace( /^0+|[.,]/g, "" );
        
        // Convert to number after cleaning
        source.system.cost = Number( source.system.cost || 0 );
      }
      source.system.price.value = source.system.cost || 0;
    }
  }
}