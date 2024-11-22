import ED4E from "../../config.mjs";
import UnitField from "./unit-field.mjs";

/**
 * Field for storing duration data.
 * @property {string} value             Scalar value for time duration units.
 * @property {string} unit              Unit that is used for the duration.
 * @property {string} special           Description of any special duration details.
 */
export default class DurationField extends UnitField {
  constructor( fields={}, options={} ) {
    super( fields, options );

    this._initFieldLocalizeKeys();

    this.fields.unit.choices = ED4E.timePeriods;
    this.fields.unit.initial = "inst";

    this.scalarConfig = ED4E.scalarTimePeriods;
    this.unitGroupOptions = {
      "":                                                   ED4E.specialTimePeriods,
      "ED.Data.Fields.Options.Duration.groupScalarTime":    ED4E.scalarTimePeriods,
      "ED.Data.Fields.Options.Duration.groupPermanentTime": ED4E.permanentTimePeriods,
    };
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /**
   * The default lang key for the object containing labels for the duration field.
   * @type {string}
   */
  get labelKey() {
    return "ED.Data.Fields.Labels.Duration";
  }

  /**
   * The default lang key for the object containing hints for the duration field.
   * @type {string}
   */
  get hintKey() {
    return "ED.Data.Fields.Hints.Duration";
  }

  /* -------------------------------------------- */
  /*  Active Effects                              */
  /* -------------------------------------------- */

  /**
   * Create duration data usable for an active effect based on this duration.
   * @this {DurationData}
   * @returns {EffectDurationData} The duration data for an active effect.
   */
  /* static getEffectDuration() {
    if ( !Number.isNumeric( this.value ) ) return {};
    switch ( this.unit ) {
      case "turn": return { turns: this.value };
      case "round": return { rounds: this.value };
      case "minute": return { seconds: this.value * 60 };
      case "hour": return { seconds: this.value * 60 * 60 };
      case "day": return { seconds: this.value * 60 * 60 * 24 };
      case "year": return { seconds: this.value * 60 * 60 * 24 * 365 };
      default: return {};
    }
  } */

}
