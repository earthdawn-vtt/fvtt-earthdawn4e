import NoneCharacterTemplate from "./templates/none-character.mjs";
import SentientTemplate from "./templates/sentient.mjs";

/**
 * System data definition for creatures.
 * @mixin
 */
export default class CreatureData extends SentientTemplate.mixin(
  NoneCharacterTemplate
) {

  /** @inheritDoc */
  static _systemType = "creature";

  /* -------------------------------------------- */

  /** @inheritDoc */
  static defineSchema() {
    return super.defineSchema();
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    super.migrateData( source );
    // specific migration functions
  }
}