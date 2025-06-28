export default class KnackMigration {

  static async migrateData( source ) {
    // Track changes for migration log journal
    const originalType = source.type;
    const changes = [];
    const changeDetails = {};

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

    // Track type change if it happened
    if ( originalType !== source.type ) {
      changes.push( `type changed from "${originalType}" to "${source.type}"` );
      changeDetails.changeType = {
        originalType: originalType,
        newType:      source.type
      };
    }

    const sourceTalentName = source.system.sourceTalentName;
    if ( sourceTalentName ) {
      // Transform sourceTalentName: replace spaces with dashes and slugify
      const sourceEdIdName = sourceTalentName
        .replace( /\s+/g, "-" ) 
        .slugify( { lowercase: true, strict: true } )
        .replace( /-+$/, "" ); // Remove trailing hyphens
      
      // Track sourceTalentName transformation if it changed
      changes.push( `Set ed-id to "${sourceEdIdName}"` );
  
      source.system.sourceTalent = sourceEdIdName;
    }
    
    // Store migration results on the source for the item document to collect
    source._migrationResults = {
      changes,
      changeDetails
    };
  
    return source;
  }
}