export default class TierMigration {

  static async migrateEarthdawnData( source ) {
  
    // Migrate tier
    if ( source.system?.tier && typeof source.system.tier === "string" ) {
      source.system.tier = source.system.tier.slugify( { lowercase: true, strict: true } );
    }
  }
}