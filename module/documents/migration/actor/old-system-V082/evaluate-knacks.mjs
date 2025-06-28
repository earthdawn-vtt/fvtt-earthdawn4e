import { addMigrationIssue } from "../../../../system/migration.mjs";

export default class EvaluateKnackMigration {

  static async migrateData( source, changes = [], changeDetails = {} ) {

    const knackTypes = [ "knackKarma", "knackManeuver", "spellKnack", "knackAbility" ];
    const talents = source.items.filter( item => item.type === "talent" );

    
    // Process knacks in reverse order to safely remove items during iteration
    for ( let i = source.items.length - 1; i >= 0; i-- ) {
      const item = source.items[i];
      
      if ( knackTypes.includes( item.type ) ) {
        
        let foundMatch = false;
        for ( const talent of talents ) {
          if ( talent.system.edid === item.system.sourceTalent ) {
            foundMatch = true;

            changes.push( `migrated "${source.name}" after setting the source Talent ot the ed-id "${talent.system.edid}"` );
            changeDetails.changeType = {
              originalType: source.system.sourceTalentName,
              newType:      source.system.sourceTalent
            };
            break; 
          }
        }
        
        if ( !foundMatch ) {
          addMigrationIssue( 
            "error", 
            "Knack", 
            item.name,
            `Source talent of knack "${item.name}" was not found for Actor @UUID[Actor.${source._id}]{${source.name}}, knack was removed, please add the knack again.`,
            { 
              actorId:          source._id,
              itemId:           item._id,
              itemType:         item.type,
              sourceTalent:     item.system.sourceTalent,
              availableTalents: talents.map( t => t.system.edid )
            }
          );
          
          // Remove the item from the array
          source.items.splice( i, 1 );
        }
      }
    }

    const evaluatedKnacks = {
      source:        source,
      changes:       changes,
      changeDetails: changeDetails
    };
    return evaluatedKnacks;
  }
}