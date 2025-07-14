import ED4E from "../../../../../config/_module.mjs";
import { determineConfigValue } from "../../../../../utils.mjs";



export default class EdIdMigration {
  
  static async migrateEarthdawnData( source ) {
    source.system ??= {};

    if ( source.system?.edid === undefined ) {
      // Slugify the name to make it easier to compare
      const slugifiedName = source.name.slugify( { lowercase: true, strict: true } );

      // Define the edid mappings
      const configMappings = [
        { names: ED4E.systemV0_8_2.threadWeavingNames, targetValue: "thread-weaving" },
        { names: ED4E.systemV0_8_2.spellcastingNames, targetValue: "spellcasting" },
        { names: ED4E.systemV0_8_2.patterncraftNames, targetValue: "patterncraft" },
        { names: ED4E.systemV0_8_2.versatilityNames, targetValue: "versatility" },
        { names: ED4E.systemV0_8_2.unarmedCombatNames, targetValue: "unarmed-combat" },
      ];

      // Use the utility function to determine the edid
      source.system.edid = determineConfigValue( slugifiedName, configMappings ) ?? "none";
    }
    return source;
  }
}