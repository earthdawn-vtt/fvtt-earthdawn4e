import ED4E from "../../../../config/_module.mjs";
import BaseMigration from "../../common/base-migration.mjs";

export default class DifficultyMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {

    if ( source.system && !source.system.difficulty ) {
      source.system.difficulty ??= {};
      if ( source.system.difficulty.target === "" ) {
        source.system.difficulty.target = "";
      } else {
        source.system.difficulty.target ??= Object.keys( ED4E.targetDifficulty )[ED4E.systemV0_8_2.targetDefense.indexOf( source.system.defenseTarget )];
      }
      if ( source.system.difficulty.group === "" ) {
        source.system.difficulty.group = "";
      } else {
        source.system.difficulty.group ??= Object.keys( ED4E.groupDifficulty )[ED4E.systemV0_8_2.groupDifficulty.indexOf( source.system.defenseGroup )];
      }
    }
  }
}