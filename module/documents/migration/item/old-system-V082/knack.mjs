import { config } from "../../../../data/item/_module.mjs";


export default class KnackMigration {

  static async migrateData( source ) {

    const slugifiedName = source.name.slugify( { strict: true, } );
    const knackType = source.system?.knackType?.slugify( { strict: true, } );

    if ( slugifiedName.includes( "karma" ) || knackType === "karma" )
      source.type = "knackKarma";
    else if ( slugifiedName.includes( "spezialmanover" ) || knackType === "maneuver" )
      source.type = "knackManeuver";
    else if ( knackType === "spell" )
      source.type = "spellKnack";
    else
      source.type = "knackAbility";

    config[ source.type ].migrateData( source.system );

    // check for edid of sourceTalentName - check both system and root level
    const sourceTalentName = source.system.sourceTalentName;
    
    if ( sourceTalentName ) {
      // Transform sourceTalentName: replace spaces with dashes and slugify
      const sourceEdIdName = sourceTalentName
        .replace( /\s+/g, "-" )  // Replace all whitespace with dashes
        .slugify( { strict: true } );  // Slugify for consistency
      
      source.system.sourceTalent = sourceEdIdName;
    }
  
    return source;
  }
}