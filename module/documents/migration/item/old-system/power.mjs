import ManeuverData from "../../../../data/item/maneuver.mjs";
import PowerData from "../../../../data/item/power.mjs";

export default class PowerMigration {

  static async migrateData( source ) {

    if ( source.system.powerType === "Power" || source.system.powerType === "Attack" ) {
      source.type = "power";
      PowerData.migrateData( source.system );
    } else if ( source.system.powerType === "Maneuver" ) {
      source.type = "maneuver";
      ManeuverData.migrateData( source.system );
    }
  
    return source; // Return the modified data
  }
}