import ED4E from "../../../../config/_module.mjs";
import BaseMigration from "../../common/base-migration.mjs";

export default class AvailabilityMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {
  
    if ( source.system?.availability ) {
      source.system.availability = source.system.availability.slugify( { lowercase: true, strict: true } );

      const availIndex = ED4E.systemV0_8_2.availability.findIndex(
        array => Array.isArray( array ) && array.includes( source.system.availability )
      );

      if ( availIndex >= 0 ) {
        source.system.availability = Object.keys( ED4E.availability )[availIndex];
      }
    }
  }
}