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
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      isAttack: new fields.BooleanField( {
        required: true,
        nullable: false,
        default:  false,
        label:    this.labelKey( "Powers.isAttack" ),
        hint:     this.hintKey( "Powers.isAttack" )
      } ),
            
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
}