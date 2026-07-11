import EdIdField from "../../fields/edid-field.mjs";
import SystemDataModel from "../../abstract/system-data-model.mjs";
import * as SYSTEM from "../../../config/system.mjs";

/**
 * @import { ItemDescriptionTemplateData } from "./_types.mjs";
 */

/**
 * Data model template with item description, summary, and Earthdawn ID.
 * @augments {SystemDataModel<ItemDescriptionTemplateData>}
 * @mixin
 * @see {@link ItemDescriptionTemplateData} The system data model for this template.
 */
export default class ItemDescriptionTemplate extends SystemDataModel {

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Description",
  ];

  // endregion

  // region Static Methods

  /** @inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.SchemaField( {
        value: new fields.HTMLField( {
          required: true, 
          nullable: true, 
        } ), 
      } ),
      summary: new fields.SchemaField( {
        value: new fields.HTMLField( {
          required: true, 
          nullable: true, 
        } ),
      } ),
      edid: new EdIdField(),
    };
  }

  // endregion

  // region Life Cycle Events

  /** @inheritdoc */
  async _preCreate( data, options, user ) {
    if ( await super._preCreate( data, options, user ) === false ) return false;

    if ( !data.system?.hasOwnProperty( "edid" )
      || data.system.edid === SYSTEM.reservedEdid.DEFAULT ) {
      this.parent.updateSource( { "system.edid": EdIdField.generateEdId( data ), } );
    }
  }

  // endregion

  // region Migration

  /** @inheritDoc */
  static migrateData( source ) {
    return super.migrateData( source );
    // specific migration functions
  }

  // endregion
}