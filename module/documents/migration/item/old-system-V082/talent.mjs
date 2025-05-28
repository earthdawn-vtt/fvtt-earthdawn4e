import RollTypeMigration from "./roll-type-Migration.mjs";
import EdIdMigration from "./edid.mjs";
import AbilityMigration from "./abilities.mjs";
import ImageMigration from "./image.mjs";
// import DefenseMigration from "./defenses.mjs";

export default class TalentMigration {

  static async migrateData( source ) {

    RollTypeMigration.migrateData( source );

    EdIdMigration.migrateData( source );

    AbilityMigration.migrateData( source );

    ImageMigration.migrateData( source );

    // DefenseMigration.migrateData( source );
  
    console.log( "source.name", source.name );
    console.log( "source.system.difficulty.target", source.system.difficulty.target );
    return source;
  }
}