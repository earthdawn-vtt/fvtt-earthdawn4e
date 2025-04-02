import KnackAbilityData from "../../../../data/item/knack-ability.mjs";
import KnackKarmaData from "../../../../data/item/knack-karma.mjs";
import KnackManeuverData from "../../../../data/item/knack-maneuver.mjs";
import SpellKnackData from "../../../../data/item/spell-knacks.mjs";

export default class KnackMigration {

  static async migrateData( source ) {

    // change the document type of knack to the new, more differentiated type by name or knackType
    if ( source.name.includes( "[Karma]" ) || source.knackType === "karma" ) {
      source.type = "knackKarma";
      KnackKarmaData.migrateData( source.system );
    } else if ( source.name.includes( "[Spezialmanöver]" ) || source.knackType === "maneuver" ) {
      source.type = "knackManeuver";
      KnackManeuverData.migrateData( source.system );
    } else if ( source.knackType === "spell" ) {
      source.type = "knackSpell";
      SpellKnackData.migrateData( source.system );
    } else {
      source.type = "knackAbility";
      KnackAbilityData.migrateData( source.system );
    }
  
    return source; // Return the modified data
  }
}