import CommonTemplate from "./templates/common.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

const fUtils = foundry.utils;

/**
 * @import { GroupSystemData } from "./_types.mjs";
 */

/**
 * System data definition for groups/organizations/etc.
 * @augments {CommonTemplate<GroupSystemData>}
 * @see {@link GroupSystemData} The system data model for this actor type.
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