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

    this.fields.value.label = `${this.labelKey}.value`;
    this.fields.value.hint = `${this.hintKey}.value`;

    this.fields.unit.label = `${this.labelKey}.unit`;
    this.fields.unit.hint = `${this.hintKey}.unit`;
    this.fields.unit.choices = ED4E.distanceUnits;
    this.fields.unit.initial = "any";

    this.fields.special.label = `${this.labelKey}.special`;
    this.fields.special.hint = `${this.hintKey}.special`;

    this.scalarConfig = ED4E.movementUnits;
    this.unitGroupOptions = {
      "":                                                   ED4E.rangeTypes,
      "ED.Data.Fields.Options.Range.groupMovementUnits":    ED4E.movementUnits,
    };
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /**
   * The default lang key for the object containing labels for the range field.
   * @type {string}
   */
  get labelKey() {
    return "ED.Data.Fields.Labels.Range";
  }

  /**
   * The default lang key for the object containing hints for the range field.
   * @type {string}
   */
  get hintKey() {
    return "ED.Data.Fields.Hints.Range";
  }

}
