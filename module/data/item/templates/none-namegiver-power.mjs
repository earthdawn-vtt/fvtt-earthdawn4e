import ActionTemplate from "./action.mjs";
import TargetTemplate from "./targeting.mjs";

/**
 * Data model template with information on Attack items.
 * @property {number} powerStep    attack step
 * @property {number} damageStep    damage step
 * @property {number} strain        strain
 * @property {string} action        action type
 */
export default class NoneNamegiverPowerData extends ActionTemplate.mixin( 
  TargetTemplate
) {

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      powerStep: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "Powers.powerStep" ),
        hint:     this.hintKey( "Powers.powerStep" )
      } ),
      damageStep: new fields.NumberField( {
        required: false,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "Powers.damageStep" ),
        hint:     this.hintKey( "Powers.damageStep" )
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
