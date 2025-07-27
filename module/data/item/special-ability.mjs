import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ItemDataModel from "../abstract/item-data-model.mjs";

/**
 * Data model template with information on Special items.
 */
export default class SpecialAbilityData extends ItemDataModel.mixin(
  ItemDescriptionTemplate
)  {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.SpecialAbility",
  ];

  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
            
    } );
  }
}