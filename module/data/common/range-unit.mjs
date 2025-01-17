import BaseUnitData from "./base-unit.mjs";
import ED4E from "../../config.mjs";

export default class RangeUnitData extends BaseUnitData {

  static {
    Object.defineProperty( this, "TYPE", { value: "range" } );
  }

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      unit: new fields.StringField( {
        required: true,
        nullable: true,
        blank:    false,
        trim:     true,
        choices:  ED4E.distanceUnits,
        initial:  "any",
        label:    this.labelKey( "RangeUnit.unit" ),
        hint:     this.hintKey( "RangeUnit.unit" ),
      } ),
    } );
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  get scalarConfig() {
    return ED4E.movementUnits;
  }

  get unitGroupOptions() {
    return {
      "":                                                   ED4E.rangeTypes,
      "ED.Data.Fields.Options.Range.groupMovementUnits":    ED4E.movementUnits,
    };
  }

}