import BaseMigration from "../../../common/base-migration.mjs";
import KnackSourceTalentMigration from "../../field-migrations/knack-source.mjs";

export default class CharacterMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {
    source.type = "character";

    const knackTypes = [
      "knackAbility",
      "knackKarma",
      "knackManeuver",
      "spellKnack"
    ];
    if ( source.items ) {
      for ( const item of source.items ) {
        if ( knackTypes.includes( item.type ) ) {
          KnackSourceTalentMigration.migrateEarthdawnData( source, item );
        }
      }
    }
  
    return source;
  }
}