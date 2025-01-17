import BaseUnitData from "./base-unit.mjs";
import FormulaField from "../fields/formula-field.mjs";
import ED4E from "../../config.mjs";

/**
 * Data model for storing area unit data.
 */
export default class AreaUnitData extends BaseUnitData {

  static {
    Object.defineProperty( this, "TYPE", { value: "area" } );
  }

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      unit:   new fields.StringField( {
        required: true,
        nullable: true,
        blank:    false,
        trim:     true,
        choices:  ED4E.movementUnits,
        initial:  null,
        label:    this.labelKey( "AreaUnit.unit" ),
        hint:     this.hintKey( "AreaUnit.unit" ),
      } ),
      count:  new FormulaField( {
        deterministic: true,
        label:         this.labelKey( "AreaUnit.count" ),
        hint:          this.hintKey( "AreaUnit.count" ),
      } ),
      areaType:   new fields.StringField( {
        required: true,
        nullable: true,
        blank:    false,
        trim:     true,
        choices:  ED4E.areaTargetDefinition,
        initial:  null,
        label:    this.labelKey( "AreaUnit.areaType" ),
        hint:     this.hintKey( "AreaUnit.areaType" ),
      } ),
      angle:     new FormulaField( {
        deterministic: true ,
        label:         this.labelKey( "AreaUnit.angle" ),
        hint:          this.hintKey( "AreaUnit.angle" ),
      } ),
      height:    new FormulaField( {
        deterministic: true,
        label:         this.labelKey( "AreaUnit.height" ),
        hint:          this.hintKey( "AreaUnit.height" ),
      } ),
      length:    new FormulaField( {
        deterministic: true,
        label:         this.labelKey( "AreaUnit.length" ),
        hint:          this.hintKey( "AreaUnit.length" ),
      } ),
      radius:    new FormulaField( {
        deterministic: true,
        label:         this.labelKey( "AreaUnit.radius" ),
        hint:          this.hintKey( "AreaUnit.radius" ),
      } ),
      thickness: new FormulaField( {
        deterministic: true,
        label:         this.labelKey( "AreaUnit.thickness" ),
        hint:          this.hintKey( "AreaUnit.thickness" ),
      } ),
      width:     new FormulaField( {
        deterministic: true,
        label:         this.labelKey( "AreaUnit.width" ),
        hint:          this.hintKey( "AreaUnit.width" ),
      } ),
    } );
  }

}