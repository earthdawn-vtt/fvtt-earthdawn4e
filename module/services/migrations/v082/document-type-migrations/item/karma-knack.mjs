
import BaseMigration from "../../../common/base-migration.mjs";
import EdIdMigration from "./edid.mjs";
import ImageMigration from "./image.mjs";

export default class KarmaKnackMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {

    EdIdMigration.migrateEarthdawnData( source );

    // Apply image migration
    ImageMigration.migrateEarthdawnData( source );

    return source;
  }
}