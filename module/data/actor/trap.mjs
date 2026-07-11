import CommonTemplate from "./templates/common.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

/**
 * @import { TrapSystemData } from "./_types.mjs";
 */

/**
 * System data definition for traps.
 * @augments {CommonTemplate<TrapSystemData>}
 * @see {@link TrapSystemData} The system data model for this actor type.
 */
export default class TrapData extends CommonTemplate {

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
    "ED.Data.Actor.Trap",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: SYSTEM_TYPES.Actor.trap,
    }, {
      inplace: false
    },
  ) );

  // endregion

}