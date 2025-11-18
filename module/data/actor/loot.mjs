import CommonTemplate from "./templates/common.mjs";
import { systemTypes } from "../../constants/constants.mjs";

const fUtils = foundry.utils;

/**
 * System data definition for loot.
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
      type: systemTypes.Actor.loot,
    }, {
      inplace: false
    },
  ) );

  // endregion

}