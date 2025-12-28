import NoneCharacterTemplate from "./templates/none-character.mjs";
import SentientTemplate from "./templates/sentient.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

const fUtils = foundry.utils;

/**
 * System data definition for dragons.
 * @mixin
 */
export default class DragonData extends SentientTemplate.mixin(
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
    "ED.Data.Actor.Dragon",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( fUtils.mergeObject(
    super.metadata,
    {
      type: SYSTEM_TYPES.Actor.dragon,
    }, {
      inplace: false
    },
  ) );

  // endregion

}