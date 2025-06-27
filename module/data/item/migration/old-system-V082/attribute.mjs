import ED4E from "../../../../config/_module.mjs";

export default class AttributeMigration {

  static migrateData( source, itemContext = null ) {
    const changes = [];
    const changeDetails = {};
  
    if ( ED4E.systemV0_8_2.attributes.includes( source.attribute ) ) {
      if ( source.attribute !== "" ) {
        source.attribute = Object.keys( ED4E.attributes )[ED4E.systemV0_8_2.attributes.indexOf( source.attribute )];
      }
    } else if ( source.attribute === "initiativeStep" ) {
      source.rollType = "initiative";
      source.attribute = "";
      changes.push( "The initiative attribute was removed. This is now a roll type setting. please check this ability if the attribute has to be set manually." );
      changeDetails.attributeChange = {
        originalAttribute: "initiativeStep",
        newAttribute:      "no Attribute",
        rollTypeSet:       "initiative"
      };
    }

    // Return changes for higher-level migration to report (backward compatibility)
    return { changes, changeDetails };
  }
}