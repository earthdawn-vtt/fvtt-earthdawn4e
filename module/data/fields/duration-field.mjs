import FormulaField from "./formula-field.mjs";
import ED4E from "../../config.mjs";

const { SchemaField, StringField } = foundry.data.fields;
const { createSelectInput } = foundry.applications.fields;

/**
 * Field for storing duration data.
 * @property {string} value             Scalar value for the activity's duration.
 * @property {string} unit              Unit that is used for the duration.
 * @property {string} special           Description of any special duration details.
 */
export default class DurationField extends SchemaField {
  constructor( fields={}, options={} ) {
    const newFields = {
      value:   new FormulaField( {
        required:      true,
        nullable:      true,
        deterministic: true,
        label:         "ED.Data.Fields.Labels.Duration.value",
        hint:          "ED.Data.Fields.Hints.Duration.value",
      } ),
      unit:   new StringField( {
        required: true,
        nullable: false,
        blank:    false,
        trim:     true,
        initial:  "inst",
        choices:  ED4E.timePeriods,
        label:    "ED.Data.Fields.Labels.Duration.unit",
        hint:     "ED.Data.Fields.Hints.Duration.unit",
      } ),
      special: new StringField( {
        label: "ED.Data.Fields.Labels.Duration.special",
        hint:  "ED.Data.Fields.Hints.Duration.special",
      } ),
      ...fields
    };
    super( newFields, options );
  }

  /* -------------------------------------------- */
  /*  Helper                                      */
  /* -------------------------------------------- */

  /**
   * Is the duration a scalar value, that is, a time unit?
   * @param {string} value The unit value to check.
   * @returns {boolean} True if the duration is a scalar value, that is, in {@link ED4E.scalarTimePeriods}.
   */
  isScalarUnit( value ) {
    return value in ED4E.scalarTimePeriods;
  }

  /**
   * Is the unit "special", needing a description?
   * @param {string} value The unit value to check.
   * @returns {boolean} True if the unit is "spec".
   */
  isSpecialUnit( value ) {
    return value === "spec";
  }

  /* -------------------------------------------- */
  /*  Form Support                                */
  /* -------------------------------------------- */

  /** @inheritDoc */
  _toInput( config ) {
    const inputs = document.createElement( "div" );
    inputs.classList.add( "form-fields" );

    if ( this.isScalarUnit( config.value.unit ) ) inputs.append( this.fields.value.toInput( {
      value:    config.value.value,
      required: false,
      localize: config.localize ?? true,
    } ) );

    inputs.append( this._getUnitInput( config ) );

    if ( this.isSpecialUnit( config.value.unit ) ) inputs.append( this.fields.special.toInput( {
      value:    config.value.special,
      required: false,
      localize: config.localize ?? true,
    } ) );

    return inputs;
  }

  /**
   * Get the unit input element for this field.
   * @param {FormInputConfig} config - The configuration for the input.
   * @returns {HTMLSelectElement} - The select input element for the unit.
   * @private
   */
  _getUnitInput( config ) {
    const unitOptions = [
      ...( this._getSelectOptionsConfig( ED4E.specialTimePeriods ) )
    ];
    unitOptions.push( ...( this._getSelectOptionsConfig(
      ED4E.scalarTimePeriods,
      "ED.Data.Fields.Options.Duration.groupScalarTime"
    ) ) );
    unitOptions.push( ...( this._getSelectOptionsConfig(
      ED4E.permanentTimePeriods,
      "ED.Data.Fields.Options.Duration.groupPermanentTime"
    ) ) );

    return createSelectInput( {
      name:     `${config.name}.unit`,
      value:    config.value.unit,
      required: true,
      localize: config.localize ?? true,
      options:  unitOptions,
    } );
  }

  /**
   * Get select options for a given enum to be used in {@link createSelectInput}.
   * @param {{string, string}} configEnum - The enum to get select options for as used in ED4E config.
   * @param {string} [group] - The group to use for the select options, if any.
   * @returns {FormSelectOption[]} - The select options for the given enum.
   */
  _getSelectOptionsConfig( configEnum, group = "" ) {
    return Object.entries( configEnum ).map( ( [ label, value ] ) => {
      return {
        value:    label,
        label:    game.i18n.localize( value ),
        group:    group,
        disabled: false,
        selected: false,
        rule:     true
      };
    } );
  }

  /** @inheritDoc */
  toFormGroup( groupConfig = {}, inputConfig = {} ) {
    return super.toFormGroup( groupConfig, inputConfig );
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
