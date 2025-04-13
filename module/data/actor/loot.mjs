import CommonTemplate from "./templates/common.mjs";

/**
 * System data definition for loot.
 */
export default class LootData extends CommonTemplate {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Actor.Loot",
  ];

  /** @inheritDoc */
  static _systemType = "loot";

  /* -------------------------------------------- */

  /** @inheritDoc */
  static defineSchema() {
    return super.defineSchema();
  }
}