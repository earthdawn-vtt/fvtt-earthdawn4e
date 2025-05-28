import ED4E from "../../../../config/_module.mjs";

export default class DefenseMigration {

  static async migrateData( source ) {
    const slugifiedName = source.name.slugify( { lowercase: true, strict: true } );

    if ( !source.system.defenseTarget ) {
      if ( ED4E.systemV0_8_2.abilityPhysicalDefense.some( physcialDefenseAbility =>
        slugifiedName.includes( physcialDefenseAbility.slugify( { lowercase: true, strict: true } ) ) ) ) {
        source.system.difficulty.target = "physical";
      } else if ( ED4E.systemV0_8_2.abilityMystiaclDefense.some( mysticalDefenseAbility =>
        slugifiedName.includes( mysticalDefenseAbility.slugify( { lowercase: true, strict: true } ) ) ) ) {
        source.system.difficulty.target = "mystical";
      } else if ( ED4E.systemV0_8_2.abilitySocialDefense.some( socialDefenseAbility =>
        slugifiedName.includes( socialDefenseAbility.slugify( { lowercase: true, strict: true } ) ) ) ) {
        source.system.difficulty.target = "social";
      } 
    }
  
    return source;
  }
}