import ImageMigration from "./image.mjs";

export default class ShieldMigration {

  static async migrateData( source ) {
  
    if ( source?._stats?.systemVersion <= "0.8.2.2" ) {
        
      ImageMigration.migrateData( source );
    }
        
    return source;
  }
}