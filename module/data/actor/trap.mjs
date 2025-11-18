import CommonTemplate from "./templates/common.mjs";
import { systemTypes } from "../../constants/constants.mjs";

/**
 * System data definition for traps.
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
      type: systemTypes.Actor.trap,
    }, {
      inplace: false
    },
  ) );

  // endregion

}