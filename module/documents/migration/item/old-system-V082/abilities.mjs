import ED4E from "../../../../config/_module.mjs";
import { determineConfigValue } from "../../../../utils.mjs";
  
export default class AbilityMigration {
  
  static async migrateData( source ) {

    // Slugify the name to make it easier to compare
    const slugifiedName = source.name.slugify( { lowercase: true, strict: true } );
    // Combine multiple arrays into one
    const combinedPhysicalAttackNames = [
      ...ED4E.systemV0_8_2.unarmedCombatNames,
      ...ED4E.systemV0_8_2.meleeWeaponNames,
      ...ED4E.systemV0_8_2.missileWeaponNames,
      ...ED4E.systemV0_8_2.throwingWeaponNames,
      ...ED4E.systemV0_8_2.offHandCombatTalents,
    ];

    const configMappings = [
      { names: combinedPhysicalAttackNames, targetValue: "physical" },
    ];

    source.system ??= {};
    source.system.difficulty ??= {};
    source.system.difficulty.target = determineConfigValue( slugifiedName, configMappings );
    
    return source;
  }
}
  