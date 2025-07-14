export default class ImageMigration {

  static async migrateEarthdawnData( source ) {
    // Only replace old earthdawn4e system paths
    if ( source.img && source.img.startsWith( "systems/earthdawn4e/" ) ) {
      source.img = "icons/svg/item-bag.svg";
    }
    return source;
  }
}