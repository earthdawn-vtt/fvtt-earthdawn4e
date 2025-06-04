import RollTypeMigration from "./roll-type-Migration.mjs";
import EdIdMigration from "./edid.mjs";
import AbilityMigration from "./abilities.mjs";
import ImageMigration from "./image.mjs";
// import DefenseMigration from "./defenses.mjs";

export default class TalentMigration {

  static async migrateData( source ) {
    if ( source?._stats?.systemVersion === "0.8.2.2" ) {

      RollTypeMigration.migrateData( source );

      EdIdMigration.migrateData( source );

      AbilityMigration.migrateData( source );

      ImageMigration.migrateData( source );

      // DefenseMigration.migrateData( source );
  
      return source;
    }
  }
}