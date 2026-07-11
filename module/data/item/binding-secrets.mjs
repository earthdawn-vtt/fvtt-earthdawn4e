import ItemDescriptionTemplate from "./templates/item-description.mjs";
import SpellData from "./spell.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

/**
 * @import { BindingSecretSystemData } from "./_types.mjs";
 */

/**
 * Data model for binding secret items.
 * @augments {SpellData<BindingSecretSystemData>}
 * @mixes ItemDescriptionTemplate
 * @see {@link BindingSecretSystemData} The system data model for binding secret items.
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
      type: SYSTEM_TYPES.Item.bindingSecret,
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