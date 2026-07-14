import CommonTemplate from "./templates/common.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

const fUtils = foundry.utils;

/**
 * @import { LootSystemData } from "./_types.mjs";
 */

/**
 * System data definition for loot.
 * @augments {CommonTemplate<LootSystemData>}
 * @see {@link LootSystemData} The system data model for this actor type.
 */
export default class LootData extends CommonTemplate {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    return super.defineSchema();
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Actor.Loot",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( fUtils.mergeObject(
    super.metadata,
    {
      type: SYSTEM_TYPES.Actor.loot,
    }, {
      inplace: false
    },
  ) );

  // endregion

}