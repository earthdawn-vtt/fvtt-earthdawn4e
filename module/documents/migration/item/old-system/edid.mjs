import ED4E from "../../../../config/_module.mjs";

export default class EdIdMigration {
  
  static async migrateData( source ) {

    source.system = source.system || {};

    if ( source.system?.edid === undefined ) {

      // slugify the name to make it easier to compare
      const slugifiedName = source.name.slugify( { lowercase: true, strict: true } );

      // check if the name is included in one of the talent name arrays to automatically set the edid
      if ( ED4E.threadWeavingNames.some( 
        talentName => slugifiedName.includes( 
          talentName.slugify( { lowercase: true, strict: true } ) ) ) ) {
        source.system.edid = "thread-weaving";
      } else if ( ED4E.spellcastingNames.some( 
        talentName => slugifiedName.includes( 
          talentName.slugify( { lowercase: true, strict: true } ) ) ) ) {
        source.system.edid = "spellcasting";
      } else if ( ED4E.patterncraftNames.some( 
        talentName => slugifiedName.includes( 
          talentName.slugify( { lowercase: true, strict: true } ) ) ) ) {
        source.system.edid = "patterncraft";
      } else if ( ED4E.versatilityNames.some( 
        talentName => slugifiedName.includes( 
          talentName.slugify( { lowercase: true, strict: true } ) ) ) ) {
        source.system.edid = "versatility";
      } else if ( ED4E.unarmedCombatNames.some( 
        talentName => slugifiedName.includes( 
          talentName.slugify( { lowercase: true, strict: true } ) ) ) ) {
        source.system.edid = "unarmed-combat";
      } else {
        source.system.edid = "none";
      }
    }
    return source;
  }
}
  