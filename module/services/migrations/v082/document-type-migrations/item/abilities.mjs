import ED4E from "../../../../../config/_module.mjs";
import { determineConfigValue } from "../../../../../utils.mjs";
import ImageMigration from "./image.mjs";
import BaseMigration from "../../../common/base-migration.mjs";

export default class AbilityMigration extends BaseMigration {
  
  static async migrateEarthdawnData( source ) {

    // Slugify the name to make it easier to compare
    const slugifiedName = source.name.slugify( { lowercase: true, strict: true } );
    // Combine multiple arrays into one
    const combinedPhysicalAttackNames = [
      ...ED4E.systemV0_8_2.unarmedCombatNames,
      ...ED4E.systemV0_8_2.meleeWeaponNames,
      ...ED4E.systemV0_8_2.missileWeaponNames,
      ...ED4E.systemV0_8_2.throwingWeaponNames,
      ...ED4E.systemV0_8_2.offHandCombatTalents,
      ...ED4E.systemV0_8_2.abilityPhysicalDefense,
    ];

    const combinedMysticalAttackNames = [
      ...ED4E.systemV0_8_2.abilityMysticalDefense,
    ];
    const combinedSocialAttackNames = [
      ...ED4E.systemV0_8_2.abilitySocialDefense,
    ];

    const configMappingsTarget = [
      { names: combinedPhysicalAttackNames, targetValue: "physical" },
      { names: combinedMysticalAttackNames, targetValue: "mystical" },
      { names: combinedSocialAttackNames, targetValue: "social" },
    ];

    source.system ??= {};
    source.system.difficulty ??= {};
    source.system.difficulty.target = source.system.difficulty.target ? source.system.difficulty.target : determineConfigValue( slugifiedName, configMappingsTarget );
    

    const combinedGroupAttackNamesMax = [
      ...ED4E.systemV0_8_2.abilityGroupDefenseMaxNames,
    ];
    const combinedGroupAttackNamesMaxPlus = [
      ...ED4E.systemV0_8_2.abilityGroupDefenseMaxNamesPlus,
    ];
    const combinedGroupAttackNamesMin = [
      ...ED4E.systemV0_8_2.abilityGroupDefenseMinNames,
    ];
    const combinedGroupAttackNamesMinPlus = [
      ...ED4E.systemV0_8_2.abilityGroupDefenseMinNamesPlus,
    ];

    const configMappingsGroup = [
      { names: combinedGroupAttackNamesMax, targetValue: "highestX" },
      { names: combinedGroupAttackNamesMaxPlus, targetValue: "highestOfGroup" },
      { names: combinedGroupAttackNamesMin, targetValue: "lowestX" },
      { names: combinedGroupAttackNamesMinPlus, targetValue: "lowestOfGroup" },
    ];

    source.system ??= {};
    source.system.difficulty ??= {};
    source.system.difficulty.group = source.system.difficulty.group ? source.system.difficulty.group : determineConfigValue( slugifiedName, configMappingsGroup );

    // Apply image migration
    ImageMigration.migrateEarthdawnData( source );

    return source;
  }
}
  