import ImageMigration from "./image.mjs";

export default class MatrixMigration {

  static async migrateEarthdawnData( source ) {
    
    // Apply image migration
    ImageMigration.migrateEarthdawnData( source );
  
    return source;
  }
}