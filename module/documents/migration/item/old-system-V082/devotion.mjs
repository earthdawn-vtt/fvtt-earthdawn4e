import ED4E from "../../../../config/_module.mjs";
import AbilityMigration from "./abilities.mjs";
import EdIdMigration from "./edid.mjs";
import ImageMigration from "./image.mjs";
import RollTypeMigration from "./roll-type-Migration.mjs";

export default class DevotionMigration {

  static async migrateData( source ) {
    if ( source?._stats?.systemVersion === "0.8.2.2" ) {
  
      RollTypeMigration.migrateData( source );
  
      EdIdMigration.migrateData( source );
  
      AbilityMigration.migrateData( source );
  
      ImageMigration.migrateData( source );
  
      // Set Durability value to 5 based on the devotion name
      const slugifiedName = source.name.slugify( { lowercase: true, strict: true } );
      if ( ED4E.systemV0_8_2.durabilityNames.some( durability =>
        slugifiedName.includes( durability.slugify( { lowercase: true, strict: true } ) )
      ) ) {
        source.system ??= {};
        source.system.durability = 5;
      }

      return source;
    }
  }
}