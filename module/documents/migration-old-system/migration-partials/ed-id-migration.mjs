import {
  oldThreadWeavingTalentNames,
  oldSpellcastingTalentNames,
  patterncraftNames,
  versatilityTalentNames,
  unarmedCombatNames,
} from "./migration-const.mjs";

export default class EdIdMigration {
    
  static async migrateData( source ) {
  
    // set ed-id based on talent names
    if ( source.system.edid === undefined ) {
      if ( oldThreadWeavingTalentNames.includes( source.name ) ) {
        source.system.edid = "thread-weaving";
      } else if ( oldSpellcastingTalentNames.includes( source.name ) ) {
        source.system.edid = "spellcasting";
      } else if ( versatilityTalentNames.includes( source.name ) ) {
        source.system.edid = "versatility";
      } else if ( unarmedCombatNames.includes( source.name ) ) {
        source.system.edid = "unarmed-combat";
      } else if ( patterncraftNames.includes( source.name ) ) {
        source.system.edid = "patterncraft";
      } else {
        source.system.edid = "none";
      }
    }
    return source; // Return the modified data
  }
}