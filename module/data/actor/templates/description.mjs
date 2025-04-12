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
          label:    "ED.Data.Actor.Labels.descriptionValue",
          hint:     "ED.Data.Actor.Hints:descriptionValue",
        } ), 
      }, {
        label: "ED.Data.Actor.Labels.description",
        hint:  "ED.Data.Actor.Hints:description",
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