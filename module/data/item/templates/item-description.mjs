import SystemDataModel from "../../abstract.mjs";
import EdIdField from "../../fields/edid-field.mjs";

/**
 * Data model template with item description
 * @mixin
 */
export default class ItemDescriptionTemplate extends SystemDataModel {

  /** @inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.SchemaField( {
        value: new fields.HTMLField( {
          required: true, 
          nullable: true, 
          label:    this.labelKey( "description" ),
          hint:     this.hintKey( "description" ),
        } ), 
      } ),
      briefDescription: new fields.SchemaField( {
        value: new fields.HTMLField( {
          required: true, 
          nullable: true, 
          label:    this.labelKey( "description" ),
          hint:     this.hintKey( "description" ),
        } ),
      } ),
      edid: new EdIdField(),
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