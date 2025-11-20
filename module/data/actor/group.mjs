import CommonTemplate from "./templates/common.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

const fUtils = foundry.utils;

/**
 * System data definition for groups/organizations/etc.
 */
export default class GroupData extends CommonTemplate {

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
    "ED.Data.Actor.Group",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( fUtils.mergeObject(
    super.metadata,
    {
      type: SYSTEM_TYPES.Actor.group,
    }, {
      inplace: false
    },
  ) );

  // endregion

}