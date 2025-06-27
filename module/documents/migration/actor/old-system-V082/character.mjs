import { addMigrationIssue } from "../../../../system/migration.mjs";
import EvaluateKnackMigration from "./evaluate-knacks.mjs";

export default class CharacterMigration {

  static async migrateData( source ) {
    const originalType = source.type;
    const changes = [];
    const changeDetails = {};
    
    source.type = "character";
    
    // Report if type was changed
    if ( originalType !== "character" ) {
      changes.push( `type changed from "${originalType}" to "character"` );
      changeDetails.changeType = {
        originalType: originalType,
        newType:      source.type
      };
    }

    EvaluateKnackMigration.migrateData( source, changes, changeDetails );
    
    if ( changes.length > 0 ) {
      addMigrationIssue( "info", "Actor", source.name, 
        `Character migration completed: ${changes.join( ", " )}`, {
          actorId:  source._id,
          itemType: source.type,
          changes:  changes,
          details:  changeDetails
        } );
    }
    
  
    return source;
  }
}