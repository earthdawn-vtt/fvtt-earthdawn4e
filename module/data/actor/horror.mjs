import NoneCharacterTemplate from "./templates/none-character.mjs";
import SentientTemplate from "./templates/sentient.mjs";

/**
 * System data definition for dragons.
 * @mixin
 */
export default class HorrorData extends SentientTemplate.mixin(
  NoneCharacterTemplate
) {

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
    "ED.Data.Actor.Horror",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: "horror",
    }, {
      inplace: false
    },
  ) );

  // endregion

}