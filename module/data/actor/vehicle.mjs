import CommonTemplate from "./templates/common.mjs";

/**
 * System data definition for vehicles.
 */
export default class VehicleData extends CommonTemplate {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Actor.Vehicle",
  ];

  /** @inheritDoc */
  static _systemType = "Vehicle";

  /* -------------------------------------------- */

  /** @inheritDoc */
  static defineSchema() {
    return super.defineSchema();
  }
}
