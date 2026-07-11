import NoneCharacterTemplate from "./templates/none-character.mjs";
import SentientTemplate from "./templates/sentient.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

/**
 * @import { HorrorSystemData } from "./_types.mjs";
 */

/**
 * System data definition for horrors.
 * @augments {SentientTemplate<HorrorSystemData>}
 * @mixes NoneCharacterTemplate
 * @see {@link HorrorSystemData} The system data model for this actor type.
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
      type: SYSTEM_TYPES.Actor.horror,
    }, {
      inplace: false
    },
  ) );

  // endregion

}