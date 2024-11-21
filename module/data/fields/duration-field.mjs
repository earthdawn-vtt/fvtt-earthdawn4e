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

    this.fields.value.label = `${this.labelKey}.value`;
    this.fields.value.hint = `${this.hintKey}.value`;

    this.fields.unit.label = `${this.labelKey}.unit`;
    this.fields.unit.hint = `${this.hintKey}.unit`;
    this.fields.unit.choices = ED4E.timePeriods;
    this.fields.unit.initial = "inst";

    this.fields.special.label = `${this.labelKey}.special`;
    this.fields.special.hint = `${this.hintKey}.special`;

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

  get labelKey() {
    return "ED.Data.Fields.Labels.Duration";
  }

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
