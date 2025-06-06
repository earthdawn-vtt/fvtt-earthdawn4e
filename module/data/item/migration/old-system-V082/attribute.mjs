import ED4E from "../../../../config/_module.mjs";

export default class AttributeMigration {

  static async migrateData( source ) {
  
    if ( ED4E.systemV0_8_2.attributes.includes( source.attribute ) ) {
      if ( source.attribute === "initiativeStep" ) {
        source.rollType = "initiative";
        source.attribute = "";
      } else if ( source.attribute !== "" ) {
        source.attribute = Object.keys( ED4E.attributes )[ED4E.systemV0_8_2.attributes.indexOf( source.attribute )];
      }
    }
  }
}