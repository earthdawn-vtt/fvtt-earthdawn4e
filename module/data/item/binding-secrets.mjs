import ItemDescriptionTemplate from "./templates/item-description.mjs";
import SpellData from "./spell.mjs";

/**
 * Data model template with information on Spell items.
 */
export default class BindingSecretData extends SpellData.mixin(
  ItemDescriptionTemplate
)  {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {

    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.BindingSecret",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: "bindingSecret",
    }, {
      inplace: false
    },
  ) );

  // endregion

  // region Rolling

  /** @inheritDoc */
  getRollData() {
    const rollData = super.getRollData();
    Object.assign( rollData, super.getTemplatesRollData() );
    return Object.assign( rollData, {} );
  }

  // endregion
}