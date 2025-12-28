import BaseMigration from "../../common/base-migration.mjs";
import { SYSTEM_TYPES } from "../../../../constants/constants.mjs";

export default class LevelMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {
  
    if ( source.system && !source.system.level && !source.system.ranks && !source.system.circle ) {
      // No level or ranks defined, nothing to migrate
      return;
    }
    
    // Migrate level from ranks if needed
    if ( source.system ) {
      if ( source.type === SYSTEM_TYPES.Item.spell ) {
        source.system.level ??= source.system.circle;
      } else {
        source.system.level ??= source.system.ranks;
      }
    }
  }
}