import ImageMigration from "./image.mjs";
import BaseMigration from "../../../common/base-migration.mjs";

export default class EquipmentMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {
    // migrate image data
    ImageMigration.migrateEarthdawnData( source );

    source.system.consumable = source.system.consumable ?? false;
        
    return source;
  }

}