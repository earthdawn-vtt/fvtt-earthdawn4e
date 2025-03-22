export default class TargetingMigration {
    
  static async migrateData( source ) {

    const oldTargetDefense = [ "", "physicaldefense", "mysticdefense", "socialdefense" ];
    const newTargetDefense = [ "", "physical", "mystical", "social" ];
    const oldGroupDifficulty = [ "", "defenseLow", "defenseLowPlus", "defenseHigh", "defenseHighPlus" ];
    const newGroupDifficulty = [ "", "lowestOfGroup", "lowestX", "highestOfGroup", "highestX" ];

    // Migrate defense target (ok)
    if ( oldTargetDefense.includes( source.defenseTarget ) && source.defenseTarget !== "" && source.difficulty?.target === undefined ) {
      if ( oldGroupDifficulty.includes( source.defenseGroup ) && source.difficulty?.group === undefined ) {
        source.difficulty = {
          ...source.difficulty,
          target: newTargetDefense[oldTargetDefense.indexOf( source.defenseTarget )],
          group:  newGroupDifficulty[oldGroupDifficulty.indexOf( source.defenseGroup )]
        };
      } else {
        source.difficulty = {
          ...source.difficulty, // Spread the existing properties of source.difficulty
          target: newTargetDefense[oldTargetDefense.indexOf( source.defenseTarget )], // Update the target property
        };
      }
    }
  
    return source; // Return the modified data
  }
}