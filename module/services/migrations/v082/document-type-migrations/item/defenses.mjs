import ED4E from "../../../../config/_module.mjs";
import BaseMigration from "../../../common/base-migration.mjs";

export default class DefenseMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {
    const slugifiedName = source.name.slugify( { lowercase: true, strict: true } );

    if ( !source.system.defenseTarget ) {
      if ( ED4E.systemV0_8_2.abilityPhysicalDefense.some( PhysicalDefenseAbility =>
        slugifiedName.includes( PhysicalDefenseAbility.slugify( { lowercase: true, strict: true } ) ) ) ) {
        source.system.difficulty.target = "physical";
      } else if ( ED4E.systemV0_8_2.abilityMysticalDefense.some( mysticalDefenseAbility =>
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