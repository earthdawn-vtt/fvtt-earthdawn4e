
import ED4E from "../../../../../config/_module.mjs";
import AbilityMigration from "./abilities.mjs";
import EdIdMigration from "./edid.mjs";
import ImageMigration from "./image.mjs";
import RollTypeMigration from "./roll-type-Migration.mjs";

export default class DevotionMigration {

  static async migrateEarthdawnData( source ) {    RollTypeMigration.migrateEarthdawnData( source );
    
    EdIdMigration.migrateEarthdawnData( source );
    
    AbilityMigration.migrateEarthdawnData( source );
    
    ImageMigration.migrateEarthdawnData( source );
  
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