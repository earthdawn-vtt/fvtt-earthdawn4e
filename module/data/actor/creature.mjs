import NoneCharacterTemplate from "./templates/none-character.mjs";
import SentientTemplate from "./templates/sentient.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

const fUtils = foundry.utils;

/**
 * @import { CreatureSystemData } from "./_types.mjs";
 */

/**
 * System data definition for creatures.
 * @augments {SentientTemplate<CreatureSystemData>}
 * @mixes NoneCharacterTemplate
 * @see {@link CreatureSystemData} The system data model for this actor type.
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
      type: SYSTEM_TYPES.Actor.creature,
    }, {
      inplace: false
    },
  ) );

  // endregion

}