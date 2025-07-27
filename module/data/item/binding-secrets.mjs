import ItemDescriptionTemplate from "./templates/item-description.mjs";
import SpellData from "./spell.mjs";

/**
 * Data model template with information on Spell items.
 */
export default class BindingSecretData extends SpellData.mixin(
  ItemDescriptionTemplate
)  {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.BindingSecret",
  ];

  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
            
    } );
  }
}