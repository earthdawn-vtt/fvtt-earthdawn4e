export default class PowerMigration {
    
  static async migrateData( source ) {
    const oldActions = [ "", "Standard", "Simple", "Free", "Sustained" ];
    const newActions = [ "", "standard", "simple", "free", "sustained" ];

    if ( source.system.powerType === "Power" || source.system.powerType === "Attack" ) {
      source.type = "power";
    } else if ( source.system.powerType === "Maneuver" ) {
      source.type = "maneuver";
    }

    // Migrate action (ok)
    if ( oldActions.includes( source.system.action ) ) {
      source.system.action = newActions[oldActions.indexOf( source.system.action )];
    }
  

    return source; // Return the modified data
  }
}