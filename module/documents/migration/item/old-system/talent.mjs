import ED4E from "../../../../config/_module.mjs";
import RollTypeMigration from "./roll-type-Migration.mjs";
import EdIdMigration from "./edid.mjs";

export default class TalentMigration {

  static async migrateData( source ) {

    RollTypeMigration.migrateData( source );

    EdIdMigration.migrateData( source );

    // set physical difficulty based on ability name
    if ( ED4E.unarmedCombatNames.includes( source.name ) 
      || ED4E.meleeWeaponNames.includes( source.name ) 
      || ED4E.missileWeaponNames.includes( source.name ) 
      || ED4E.throwingWeaponNames.includes( source.name ) ) {
      if ( ED4E.oldTargetDefense.includes( source.system.defenseTarget ) && source.system.difficulty?.target === undefined ) {
        source.system.difficulty = {target: "physical" };
      }
    }
  
    return source;
  }
}