export default class UsableItemMigration {

  static async migrateData( source ) {
    if ( source.rollableItem ) {
      source.usableItem ??= {};
      source.usableItem.isUsableItem = true;
      source.usableItem.arbitraryStep = Number( source.arbitraryStep ) || 0;
      source.usableItem.recoveryPropertyValue = source.healing || 0;
    }
  }
}