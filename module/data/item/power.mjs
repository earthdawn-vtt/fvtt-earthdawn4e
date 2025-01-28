import NoneNamegiverPowerData from "./templates/none-namegiver-power.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";

/**
 * Data model template with information on Power items.
 */
export default class PowerData extends NoneNamegiverPowerData.mixin(
  ItemDescriptionTemplate
)  {

  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
    } );
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    super.migrateData( source );
    // specific migration functions
  }

  /* -------------------------------------------- */
  /*  Getter                                      */
  /* -------------------------------------------- */
  /**
   *@type {boolean}
   */
  get isCreatureAttack() {
    return this.edid === game.settings.get( "ed4e", "edidCreatureAttack" );
  }
}