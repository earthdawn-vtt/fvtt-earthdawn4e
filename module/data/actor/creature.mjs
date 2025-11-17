import NoneCharacterTemplate from "./templates/none-character.mjs";
import SentientTemplate from "./templates/sentient.mjs";

const fUtils = foundry.utils;

/**
 * System data definition for creatures.
 * @mixin
 */
export default class CreatureData extends SentientTemplate.mixin(
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
    "ED.Data.Actor.Creature",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( fUtils.mergeObject(
    super.metadata,
    {
      type: "creature",
    }, {
      inplace: false
    },
  ) );

  // endregion

}