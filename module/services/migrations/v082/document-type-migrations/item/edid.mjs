import ED4E from "../../../../../config/_module.mjs";
import { determineConfigValue } from "../../../../../utils.mjs";
import BaseMigration from "../../../common/base-migration.mjs";
import MatrixMigration from "./matrix.mjs";

export default class EdIdMigration extends BaseMigration {
  
  static async migrateEarthdawnData( source ) {
    source.system ??= {};

    if ( source.system?.edid === undefined ) {
      // Existing code for determining edid...
      const slugifiedName = source.name.slugify( { lowercase: true, strict: true } );
      const configMappings = [
        { names: ED4E.systemV0_8_2.threadWeavingNames, targetValue: "thread-weaving" },
        { names: ED4E.systemV0_8_2.spellcastingNames, targetValue: "spellcasting" },
        { names: ED4E.systemV0_8_2.patterncraftNames, targetValue: "patterncraft" },
        { names: ED4E.systemV0_8_2.versatilityNames, targetValue: "versatility" },
        { names: ED4E.systemV0_8_2.unarmedCombatNames, targetValue: "unarmed-combat" },
        {
          names: [
            ...ED4E.systemV0_8_2.standardMatrixNames,
            ...ED4E.systemV0_8_2.enhancedMatrixNames,
            ...ED4E.systemV0_8_2.armoredMatrixNames,
            ...ED4E.systemV0_8_2.sumMatrixNames
          ],
          targetValue: "matrix"
        },
      ];

      source.system.edid = determineConfigValue( slugifiedName, configMappings ) ?? "none";

      if ( source.system.edid === "matrix" ) {
        // Apply matrix migration directly since the item type might not be "spellmatrix"
        await MatrixMigration.migrateEarthdawnData( source );
      }
    }
    return source;
  }
}