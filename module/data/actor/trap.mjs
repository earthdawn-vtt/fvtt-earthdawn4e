import CommonTemplate from "./templates/common.mjs";

/**
 * System data definition for traps.
 */
export default class TrapData extends CommonTemplate {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Actor.Trap",
  ];

  /** @inheritDoc */
  static _systemType = "trap";

  /* -------------------------------------------- */

  /** @inheritDoc */
  static defineSchema() {
    return super.defineSchema();
  }
}