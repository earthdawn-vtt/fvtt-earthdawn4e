import RollTypeMigration from "./roll-type-Migration.mjs";
import EdIdMigration from "./edid.mjs";
import AbilityMigration from "./abilities.mjs";

export default class TalentMigration {

  static async migrateData( source ) {

    RollTypeMigration.migrateData( source );

    EdIdMigration.migrateData( source );

    AbilityMigration.migrateData( source );
  
    return source;
  }
}