import ED4E from "../../../../config/_module.mjs";
import ImageMigration from "./image.mjs";

export default class ShieldMigration {

  static async migrateData( source ) {
  
    if ( source?._stats?.systemVersion <= "0.8.2.2" ) {
        
      ImageMigration.migrateData( source );

      // set bow usage based on slugified name
      const slugifiedName = source.name.slugify( { lowercase: true, strict: true } );

      if ( ED4E.systemV0_8_2.shieldBowUsageNames.some( shieldNames =>
        slugifiedName.includes( shieldNames.slugify( { lowercase: true, strict: true } ) ) ) ) {
        source.system.bowUsage = true;
      }
    }
    return source;
  }
}