import ED4E from "../../../../config/_module.mjs";
import { determineConfigValue } from "../../../../utils.mjs";
  
export default class AbilityMigration {
  
  static async migrateData( source ) {

    // Slugify the name to make it easier to compare
    const slugifiedName = source.name.slugify( { lowercase: true, strict: true } );
    // Combine multiple arrays into one
    const combinedPhysicalAttackNames = [
      ...ED4E.unarmedCombatNames,
      ...ED4E.meleeWeaponNames,
      ...ED4E.missileWeaponNames,
      ...ED4E.throwingWeaponNames,
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
  