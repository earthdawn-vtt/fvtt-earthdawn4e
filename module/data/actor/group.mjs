import CommonTemplate from "./templates/common.mjs";

/**
 * System data definition for groups/organizations/etc.
 */
export default class GroupData extends CommonTemplate {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Actor.Group",
  ];

  /** @inheritDoc */
  static _systemType = "group";

  /* -------------------------------------------- */

  /** @inheritDoc */
  static defineSchema() {
    return super.defineSchema();
  }
}