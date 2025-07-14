import ImageMigration from "./image.mjs";

export default class EquipmentMigration {

  static async migrateEarthdawnData( source ) {
    // migrate image data
    ImageMigration.migrateEarthdawnData( source );

    source.system.consumable = source.system.consumable ?? false;
        
    return source;
  }

}