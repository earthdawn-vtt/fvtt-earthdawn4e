import BaseMigration from "../../common/base-migration.mjs";

export default class UsableItemMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {
    if ( source.system?.rollableItem ) {
      source.system.usableItem ??= {};
      source.system.usableItem.isUsableItem = true;
      source.system.usableItem.arbitraryStep = Number( source.system.arbitraryStep ) || 0;
      source.system.usableItem.recoveryPropertyValue = source.system.healing || 0;
    }
  }
}