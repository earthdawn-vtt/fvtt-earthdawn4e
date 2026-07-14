import NoneCharacterTemplate from "./templates/none-character.mjs";
import SentientTemplate from "./templates/sentient.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

/**
 * @import { SpiritSystemData } from "./_types.mjs";
 */

/**
 * System data definition for spirits.
 * @augments {SentientTemplate<SpiritSystemData>}
 * @mixes NoneCharacterTemplate
 * @see {@link SpiritSystemData} The system data model for this actor type.
 */
export default class SpiritData extends SentientTemplate.mixin(
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
    "ED.Data.Actor.Spirit",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: SYSTEM_TYPES.Actor.spirit,
    }, {
      inplace: false
    },
  ) );

  // endregion

}