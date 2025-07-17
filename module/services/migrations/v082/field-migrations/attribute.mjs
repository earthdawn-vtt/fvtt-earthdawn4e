import ED4E from "../../../../config/_module.mjs";
import BaseMigration from "../../common/base-migration.mjs";

export default class AttributeMigration extends BaseMigration {

  static migrateEarthdawnData( source, migrationId = "" ) {
    
    if ( source.system?.attribute && typeof source.system.attribute === "string" ) {
      
      if ( ED4E.MIGRATIONS.systemV0_8_2.attributes.includes( source.system.attribute ) ) {
        if ( source.system.attribute === "initiativeStep" ) {
          source.system.rollType = "initiative";
          source.system.attribute = "";
        } else if ( source.system.attribute !== "" ) {
          source.system.attribute = Object.keys( ED4E.ACTORS.attributes )[ED4E.MIGRATIONS.systemV0_8_2.attributes.indexOf( source.system.attribute )];
        }
      }
    }
  }
}