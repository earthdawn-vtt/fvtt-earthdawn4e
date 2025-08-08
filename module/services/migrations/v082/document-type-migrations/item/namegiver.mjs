import ImageMigration from "./image.mjs";
import BaseMigration from "../../../common/base-migration.mjs";
import ED4E from "../../../../../config/_module.mjs";

export default class NamegiverMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {
    
    // Apply image migration
    ImageMigration.migrateEarthdawnData( source );

    if ( source.system ) {
      // Migrate attributes
      if (
        Object.keys( source.system.attributes )
          .some( attr => ED4E.MIGRATIONS.systemV0_8_2.attributeValues.includes( attr ) )
      ) {
        const old = source.system.attributes;
        source.system.attributeValues = {
          dex:     old.dexterityvalue ?? 10,
          str:     old.strengthvalue ?? 10,
          tou:     old.toughnessvalue ?? 10,
          per:     old.perceptionvalue ?? 10,
          wil:     old.willpowervalue ?? 10,
          cha:     old.charismavalue ?? 10,
        };
      }
   
      // Migrate karma modifier
      source.system.karmaModifier = source.system.karmamodifier;

      // Migrate movement
      source.system.movement = {walk:  source.system.movement};

      // Migrate Namegiver ability description.
      if ( source.system.description.value ) {
        // yes there is a spelling mistake in the old system.
        source.system.description.value += "<br>" + source.system.racialAbilites;
      }
    }

    return source;
  }
}