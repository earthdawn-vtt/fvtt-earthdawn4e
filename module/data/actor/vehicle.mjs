import CommonTemplate from "./templates/common.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

/**
 * System data definition for vehicles.
 */
export default class VehicleData extends CommonTemplate {

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
    "ED.Data.Actor.Vehicle",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: SYSTEM_TYPES.Actor.vehicle,
    }, {
      inplace: false
    },
  ) );

  // endregion

}
