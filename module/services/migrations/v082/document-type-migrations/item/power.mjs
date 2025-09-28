import ImageMigration from "./image.mjs";
import BaseMigration from "../../../common/base-migration.mjs";
import DifficultyMigration from "../../field-migrations/difficulty.mjs";
import ActionMigration from "../../field-migrations/action.mjs";

export default class PowerMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {

    // Apply image migration
    ImageMigration.migrateEarthdawnData( source );

    DifficultyMigration.migrateEarthdawnData( source );

    ActionMigration.migrateEarthdawnData( source );

    if ( !source.system.powerStep ) {
      source.system.powerStep = source.system.attackstep;
    }

    if ( !source.system.damageStep ) {
      source.system.damageStep = source.system.damagestep;
    }

    if ( !source.system.rollType && source.system.powerType.slugify( { lowercase: true, strict: true } ) === "attack" ) {
      source.system.rollType = "attack";
      source.type = "power";
    } else if ( !source.system.rollType && source.system.powerStep > 0 ){
      source.system.rollType = "ability";
    }

    // Note: Data model migration is handled by field-level migrations
    // config[source.type] represents data models, not migration classes

    return source;
  }
}