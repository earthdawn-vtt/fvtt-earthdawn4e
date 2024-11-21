import FormulaField from "./formula-field.mjs";

const { SchemaField, StringField } = foundry.data.fields;
const { createSelectInput } = foundry.applications.fields;


export default class UnitField extends SchemaField {

  constructor( fields={}, options={} ) {
    const newFields = {
      value:   new FormulaField( {
        required:      true,
        nullable:      true,
        deterministic: true,
      } ),
      unit:   new StringField( {
        required: true,
        nullable: false,
        blank:    false,
        trim:     true,
      } ),
      special: new StringField( {
      } ),
      ...fields
    };

    super( newFields, options );

    this.scalarConfig = {};
    this.specialUnitKey = "spec";
    this.unitGroupOptions = {};
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  get labelKey() {
    throw new Error( "The labelKey getter must be implemented by the subclass." );
  }

  get hintKey() {
    throw new Error( "The hintKey getter must be implemented by the subclass." );
  }

  /* -------------------------------------------- */
  /*  Helper                                      */
  /* -------------------------------------------- */

  /**
   * Is the range a scalar value, that is, a distance unit?
   * @param {string} value The unit value to check.
   * @returns {boolean} True if the range is a scalar value, that is, in {@link ED4E.scalarTimePeriods}.
   */
  isScalarUnit( value ) {
    return value in this.scalarConfig;
  }

  /**
   * Is the unit "special", needing a description?
   * @param {string} value The unit value to check.
   * @returns {boolean} True if the unit is "spec".
   */
  isSpecialUnit( value ) {
    return value === this.specialUnitKey;
  }

  /**
   * Get the unit input element for this field.
   * @param {FormInputConfig} config - The configuration for the input.
   * @param {Record<string, Record<string,string>>} groupedOptions - The options as values for the select input with the group name as the key.
   * @returns {HTMLSelectElement} - The select input element for the unit.
   * @private
   */
  static _getUnitInput( config, groupedOptions ) {

    const unitOptions = [];
    for ( const [ group, options ] of Object.entries( groupedOptions ) ) {
      unitOptions.push( ...( this._getSelectOptionsConfig(
        options,
        group
      ) ) );
    }

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
   * @param {Record<string,string>} configEnum - The enum to get select options for as used in ED4E config.
   * @param {string} [group] - The group to use for the select options, if any.
   * @returns {FormSelectOption[]} - The select options for the given enum.
   */
  static _getSelectOptionsConfig( configEnum, group = "" ) {
    return Object.entries( configEnum ).map( ( [ label, value ] ) => {
      return {
        value:    label,
        label:    game.i18n.localize( value ),
        group:    group,
        disabled: false,
        selected: false,
        rule:     false,
      };
    } );
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

    inputs.appendChild( this.constructor._getUnitInput(
      config,
      this.unitGroupOptions
    ) );

    if ( this.isSpecialUnit( config.value.unit ) ) inputs.append( this.fields.special.toInput( {
      value:    config.value.special,
      required: false,
      localize: config.localize ?? true,
    } ) );

    return inputs;
  }

}