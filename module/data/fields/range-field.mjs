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

    this._initFieldLocalizeKeys();

    this.fields.unit.choices = ED4E.distanceUnits;
    this.fields.unit.initial = "any";

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
