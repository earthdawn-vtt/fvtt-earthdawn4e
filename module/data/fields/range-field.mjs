import ED4E from "../../config.mjs";
import UnitField from "./unit-field.mjs";


/**
 * Field for storing range data.
 * @property {string} value             Scalar value for distance units.
 * @property {string} unit              Unit that is used for the range.
 * @property {string} special           Description of any special range details.
 */
export default class RangeField extends UnitField {
  constructor( fields={}, options={} ) {
    super( fields, options );

    this.fields.value.label = "ED.Data.Fields.Labels.Range.value";
    this.fields.value.hint = "ED.Data.Fields.Hints.Range.value";

    this.fields.unit.label = "ED.Data.Fields.Labels.Range.unit";
    this.fields.unit.hint = "ED.Data.Fields.Hints.Range.unit";
    this.fields.unit.choices = ED4E.distanceUnits;
    this.fields.unit.initial = "any";

    this.fields.special.label = "ED.Data.Fields.Labels.Range.special";
    this.fields.special.hint = "ED.Data.Fields.Hints.Range.special";

    this.scalarConfig = ED4E.movementUnits;
    this.unitGroupOptions = {
      "":                                                   ED4E.rangeTypes,
      "ED.Data.Fields.Options.Range.groupMovementUnits":    ED4E.movementUnits,
    };
  }

}
