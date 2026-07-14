import ItemDescriptionTemplate from "./templates/item-description.mjs";
import KnackTemplate from "./templates/knack-item.mjs";

import ItemDataModel from "../abstract/item-data-model.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

/**
 * @import { KnackKarmaSystemData } from "./_types.mjs";
 */

/**
 * Data model for knack karma items.
 * @augments {ItemDataModel<KnackKarmaSystemData>}
 * @mixes KnackTemplate
 * @mixes ItemDescriptionTemplate
 * @see {@link KnackKarmaSystemData} The system data model for knack karma items.
 */
export default class KnackKarmaData extends ItemDataModel.mixin(
  KnackTemplate,
  ItemDescriptionTemplate
) {

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
    "ED.Data.Item.KnackKarma",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: SYSTEM_TYPES.Item.knackKarma,
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