import NoneCharacterTemplate from "./templates/none-character.mjs";
import NamegiverTemplate from "./templates/namegiver.mjs";

/**
 * System data definition for NPCs.
 * @mixin
 */
export default class NpcData extends NamegiverTemplate.mixin(
  NoneCharacterTemplate
) {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Actor.Npc",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: "npc",
    }, {
      inplace: false
    },
  ) );

  // endregion

  // region Data Preparation

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    // this.#prepareBaseAttributes();
  }

  // endregion

}