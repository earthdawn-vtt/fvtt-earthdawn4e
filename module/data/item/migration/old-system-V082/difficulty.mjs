import ED4E from "../../../../config/_module.mjs";

export default class DifficultyMigration {

  static async migrateData( source ) {

    // if ( source?._stats?.systemVersion === "0.8.2.2" ) {
    if ( !source.difficulty ) {
      source.difficulty ??= {};
      if ( source.difficulty.target === "" ) {
        source.difficulty.target = "";
      } else {
        source.difficulty.target ??= Object.keys( ED4E.targetDifficulty )[ED4E.systemV0_8_2.targetDefense.indexOf( source.defenseTarget )];
      }
      if ( source.difficulty.group === "" ) {
        source.difficulty.group = "";
      } else {
        source.difficulty.group ??= Object.keys( ED4E.groupDifficulty )[ED4E.systemV0_8_2.groupDifficulty.indexOf( source.defenseGroup )];
      }
    }
    // }
  }
}