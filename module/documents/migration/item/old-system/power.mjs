export default class PowerMigration {

  static async migrateData( source ) {

    if ( source.system.powerType === "Power" || source.system.powerType === "Attack" ) {
      source.type = "power";
    } else if ( source.system.powerType === "Maneuver" ) {
      source.type = "maneuver";
    }
  
    return source; // Return the modified data
  }
}