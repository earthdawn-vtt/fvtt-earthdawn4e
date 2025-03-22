import KnackAbilityData from "../../../data/item/knack-ability.mjs";
import KnackKarmaData from "../../../data/item/knack-karma.mjs";
import KnackManeuverData from "../../../data/item/knack-maneuver.mjs";


export default class KnackMigration {
  static async migrateData( source ) {
    // Check if the name contains "[Karma]"
    if ( source.name.includes( "[Karma]" ) ) {
      source.type = "knackKarma";
      KnackKarmaData.migrateData( source.system );
    } else if ( source.name.includes( "[[Spezialmanöver]" ) ) {
      source.type = "knackManeuver";
      KnackManeuverData.migrateData( source.system );
    } else {
      source.type = "knackAbility";
      KnackAbilityData.migrateData( source.system );
    }

    return source; // Return the modified data
  }
}