import SystemDataModel from "../../abstract/system-data-model.mjs";

/**
 * @import { ActorDescriptionData } from "./_types.mjs";
 */

/**
 * Data model template with Actor description.
 * @augments {SystemDataModel<ActorDescriptionData>}
 * @mixin
 * @see {@link ActorDescriptionData} The system data model for this template.
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

}