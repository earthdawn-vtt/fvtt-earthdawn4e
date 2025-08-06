import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ItemDataModel from "../abstract/item-data-model.mjs";

/**
 * Data model template with information on Maneuver items.
 * @property {number} extraSuccesses        extra successes to trigger the maneuver
 */
export default class ManeuverData extends ItemDataModel.mixin(
  ItemDescriptionTemplate
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Maneuver",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      extraSuccesses: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
    } );
  }
}