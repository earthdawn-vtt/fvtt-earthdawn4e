import SystemDataModel from "../../abstract.mjs";

/**
 * Data model template with Actor description
 * @mixin
 */
export default class ActorDescriptionTemplate extends SystemDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Actor",
  ];

  /** @inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.SchemaField( {
        value: new fields.HTMLField( {
          required: true, 
          nullable: true, 
        } ), 
      } )
    };
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    super.migrateData( source );
    // specific migration functions
  }
}