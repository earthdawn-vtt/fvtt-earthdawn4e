import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ItemDataModel from "../abstract/item-data-model.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

/**
 * @import { SpecialAbilitySystemData } from "./_types.mjs";
 */

/**
 * Data model for special ability items.
 * @augments {ItemDataModel<SpecialAbilitySystemData>}
 * @mixes ItemDescriptionTemplate
 * @see {@link SpecialAbilitySystemData} The system data model for special ability items.
 */
export default class SpecialAbilityData extends ItemDataModel.mixin(
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
    "ED.Data.Item.SpecialAbility",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: SYSTEM_TYPES.Item.specialAbility,
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