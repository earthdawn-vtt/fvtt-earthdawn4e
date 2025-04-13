import ActorDescriptionTemplate from "./templates/description.mjs";
import NamegiverTemplate from "./templates/namegiver.mjs";

/**
 * System data definition for NPCs.
 * @mixin
 */
export default class NpcData extends NamegiverTemplate.mixin(
  ActorDescriptionTemplate
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Actor.Npc",
  ];

  /** @inheritDoc */
  static _systemType = "npc";

  /* -------------------------------------------- */

  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
    } );
  }

  /* -------------------------------------------- */
  /*  Data Preparation              */
  /* -------------------------------------------- */

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    // this.#prepareBaseAttributes();
  }

  /* -------------------------------------------- */

  /*   /!**
     * Prepare calculated attribute values and corresponding steps.
     * @private
     *!/
    #prepareBaseAttributes() {
      for ( const attributeData of Object.values( this.attributes ) ) {
        attributeData.baseStep = attributeData.step;
      }
    } */

  /* -------------------------------------------- */
  /*  Migrations                  */
  /* -------------------------------------------- */
  /** @inheritDoc */
  static migrateData( source ) {
    super.migrateData( source );
    // specific migration functions
  }
}