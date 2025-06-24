import ED4E from "../../../../config/_module.mjs";

export default class AvailabilityMigration {

  static async migrateData( source ) {
  
    source.availability = source.availability?.slugify( { lowercase: true, strict: true } );

    const availIndex = ED4E.systemV0_8_2.availability.findIndex(
      array => Array.isArray( array ) && array.includes( source.availability )
    );

    if ( availIndex !== -1 ) {
      source.availability = Object.keys( ED4E.availability )[availIndex];
    }
  }
}