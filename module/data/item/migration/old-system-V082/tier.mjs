export default class TierMigration {

  static async migrateData( source ) {
  
    // Migrate tier
    if ( source.tier ) {
      source.tier = source.tier.slugify( { lowercase: true, strict: true } );;
    }
  }
}