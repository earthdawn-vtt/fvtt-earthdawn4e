export default class ImageMigration {

  static async migrateData( source ) {

    source.img = "icons/svg/item-bag.svg";
    return source;
  }
}