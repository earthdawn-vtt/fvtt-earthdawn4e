import { addMigrationIssue } from "../../../../system/migration.mjs";

export default class KnackMigration {

  static async migrateData( source ) {

    // minLevel
    // lpCost
    // restrictions
    // requirements
  
    const changes = [];
    const changeDetails = {};
    // migrate source Talent of the knack
    source.sourceTalent = source.sourceTalentName?.toLowerCase().replace( /\s+/g, "-" ) || "";
    changes.push( `type changed from "${"originalType"}" to "character"` );
    changeDetails.changeType = {
      originalType: "originalType",
      newType:      source.type
    };
    

    // rollType has to be set to ability by default if an attribute is set

    if ( changes.length > 0 ) {
      addMigrationIssue( "info", "Actor", source.name, 
        `Character migration completed: ${changes.join( ", " )}`, {
          actorId:  source._id,
          itemType: source.type,
          changes:  changes,
          details:  changeDetails
        } );
    }
  }
}