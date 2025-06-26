import { addMigrationIssue } from "../../../../system/migration.mjs";

export default class CharacterMigration {

  static async migrateData( source ) {
    source.type = "character";

    const knackTypes = [
      "knackKarma",
      "knackManeuver",
      "spellKnack",
      "knackAbility"
    ];
    const talents = source.items.filter( item => item.type === "talent" );
    
    // Process knacks in reverse order to safely remove items during iteration
    for ( let i = source.items.length - 1; i >= 0; i-- ) {
      const item = source.items[i];
      
      if ( knackTypes.includes( item.type ) ) {
        // Migrate Knack items
        console.log ( "itemData", item );
        
        let foundMatch = false;
        for ( const talent of talents ) {
          if ( talent.system.edid === item.system.sourceTalent ) {
            console.log( `Found matching talent: ${talent.name} (edid: ${talent.system.edid}) for knack: ${item.name}` );
            foundMatch = true;
            break; // Exit the loop once we find a match
          }
        }
        
        // Only log error if no match was found
        if ( !foundMatch ) {
          addMigrationIssue( 
            "error", 
            "Knack", 
            item.name,
            `Source talent of knack "${item.name}" was not found for Actor "${source.name}", knack was removed, please add the knack again.`,
            { 
              sourceTalent:     item.system.sourceTalent,
              availableTalents: talents.map( t => t.system.edid )
            }
          );
          
          // Remove the item from the array
          source.items.splice( i, 1 );
        }
      }
    }
  
    return source;
  }
}