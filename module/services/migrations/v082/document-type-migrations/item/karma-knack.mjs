
import BaseMigration from "../../../common/base-migration.mjs";
import EdIdMigration from "./edid.mjs";

export default class KarmaKnackMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {

    EdIdMigration.migrateEarthdawnData( source );

    return source;
  }
}