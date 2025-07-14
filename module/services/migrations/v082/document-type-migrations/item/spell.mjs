import ImageMigration from "./image.mjs";

export default class SpellMigration {

  static async migrateEarthdawnData( source ) {
    
    // Apply image migration
    ImageMigration.migrateEarthdawnData( source );
  
    return source;
  }
}