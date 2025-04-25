import ED4E from "../../../../config/_module.mjs";

  
export default class EdIdMigration {
  
  static async migrateData( source ) {
  
    // set ed-id based on talent names
    if ( source.system.edid === undefined ) {
      if ( ED4E.oldThreadWeavingTalentNames.includes( source.name ) ) {
        source.system.edid = "thread-weaving";
      } else if ( ED4E.oldSpellcastingTalentNames.includes( source.name ) ) {
        source.system.edid = "spellcasting";
      } else if ( ED4E.versatilityTalentNames.includes( source.name ) ) {
        source.system.edid = "versatility";
      } else if ( ED4E.unarmedCombatNames.includes( source.name ) ) {
        source.system.edid = "unarmed-combat";
      } else if ( ED4E.patterncraftNames.includes( source.name ) ) {
        source.system.edid = "patterncraft";
      } else {
        source.system.edid = "none";
      }
    }
    return source; // Return the modified data
  }
}
  