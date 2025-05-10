import ED4E from "../../../../config/_module.mjs";
  
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
    
    // Set the target difficulty of all combat abilties to "physical" if the slugified name includes any of the combined physical attack names
    if ( source.system?.difficulty?.target === undefined ) {
      if ( combinedPhysicalAttackNames.some( abilityName =>
        slugifiedName.includes( abilityName.slugify( { lowercase: true, strict: true } ) )
      )
      ) { 
        source.system.difficulty = { target: "physical" };
      }
    }
    return source;
  }
}
  