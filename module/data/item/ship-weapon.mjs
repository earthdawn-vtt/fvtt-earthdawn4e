import { ItemDataModel } from "../abstract.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";

/**
 * Data model template with information on namegiver items.
 * @property {number} firePowerPoints   Fire power of the weapon
 * @property {number} crewWeapon        required crew to handle the weapon
 * @property {number} rangeShort        short range
 * @property {number} rangeLong         long range
 * @property {number} salvoCost         cost per salvo
 * @property {number} charakterDamage   weapon damage on a sentient being
 */
export default class ShipWeaponData extends ItemDataModel.mixin(
  ItemDescriptionTemplate
) {
  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      firePowerPoints: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "ShipWeapon.firePowerPoints" ),
        hint:     this.hintKey( "ShipWeapon.firePowerPoints" )
      } ), 
      crewWeapon: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "ShipWeapon.crewWeapon" ),
        hint:     this.hintKey( "ShipWeapon.crewWeapon" )
        
      } ), 
      range: new fields.SchemaField( {
        short: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
          label:    this.labelKey( "ShipWeapon.rangeShort" ),
          hint:     this.hintKey( "ShipWeapon.rangeShort" )
        } ), 
        long: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
          label:    this.labelKey( "ShipWeapon.rangeLong" ),
          hint:     this.hintKey( "ShipWeapon.rangeLong" )
        } ), 
      } ),
      salvoCost: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "ShipWeapon.salvoCost" ),
        hint:     this.hintKey( "ShipWeapon.salvoCost" )
      } ), 
      characterDamage: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "ShipWeapon.characterDamage" ),
        hint:     this.hintKey( "ShipWeapon.characterDamage" )
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