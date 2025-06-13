import ED4E from "../../../../config/_module.mjs";

export default class AvailabilityMigration {

  static async migrateData( source ) {
  
    source.availability = source.availability?.slugify( { lowercase: true, strict: true } );
    if ( ED4E.systemV0_8_2.availability.includes( source.availability ) ) {
      source.availability = Object.keys( ED4E.availability )[ED4E.systemV0_8_2.availability.indexOf( source.availability )];
    }
  }
}