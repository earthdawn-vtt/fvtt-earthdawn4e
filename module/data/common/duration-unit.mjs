import BaseUnitData from "./base-unit.mjs";
import ED4E from "../../config.mjs";

export default class DurationUnitData extends BaseUnitData {

  static {
    Object.defineProperty( this, "TYPE", { value: "duration" } );
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
        choices:  ED4E.timePeriods,
        initial:  "inst",
        label:    this.labelKey( "DurationUnit.unit" ),
        hint:     this.hintKey( "DurationUnit.unit" ),
      } ),
    } );
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  get scalarConfig() {
    return ED4E.scalarTimePeriods;
  }

  get unitGroupOptions() {
    return {
      "":                                                   ED4E.specialTimePeriods,
      "ED.Data.Fields.Options.Duration.groupScalarTime":    ED4E.scalarTimePeriods,
      "ED.Data.Fields.Options.Duration.groupPermanentTime": ED4E.permanentTimePeriods,
    };
  }

}