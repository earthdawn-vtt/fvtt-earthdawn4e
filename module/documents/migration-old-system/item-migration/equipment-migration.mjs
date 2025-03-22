import { ammunitionArrowNames, ammunitionBoltNames, ammunitionNeedleNames } from "../migration-partials/migration-const.mjs";

export default class EquipmentMigration {
    
  static async migrateData( source ) {


    // Migrate Ammunition by Old item names
    if ( ammunitionArrowNames.includes( source.name ) || ammunitionBoltNames.includes( source.name ) || ammunitionNeedleNames.includes( source.name ) ) {
      source.system.consumable = true;
      if ( ammunitionArrowNames.includes( source.name ) && source.system?.ammunition?.type === undefined ) {
        source.system.ammunition = {
          ...source.system.ammunition,
          type: "arrow"
        };
        if ( source.system.bundleSize === undefined ) {
          source.system.bundleSize = 20;
        }
      } else if ( ammunitionBoltNames.includes( source.name ) && source.system?.ammunition?.type === undefined ) {
        source.system.ammunition = {
          ...source.system.ammunition,
          type: "bolt"
        };
        if ( source.system.bundleSize === undefined ) {
          source.system.bundleSize = 20;
        }
      } else if ( ammunitionNeedleNames.includes( source.name ) && source.system?.ammunition?.type === undefined ) {
        source.system.ammunition = {
          ...source.system.ammunition,
          type: "needle"
        };
        if ( source.system.bundleSize === undefined ) {
          source.system.bundleSize = 10;
        }
      }
    }
    

    return source; // Return the modified data
  }
}