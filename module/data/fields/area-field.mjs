import FormulaField from "./formula-field.mjs";
import UnitField from "./unit-field.mjs";
import ED4E from "../../config.mjs";

const { StringField } = foundry.data.fields;

export default class AreaField extends UnitField {

  constructor( fields={}, options={} ) {
    const newFields = {
      count:  new FormulaField( { deterministic: true } ),
      type:   new StringField( {
        required: true,
        nullable: true,
        blank:    false,
        trim:     true,
        choices:  ED4E.areaTargetDefinition,
        initial:  null,
      } ),
      angle:     new FormulaField( { deterministic: true } ),
      height:    new FormulaField( { deterministic: true } ),
      length:    new FormulaField( { deterministic: true } ),
      radius:    new FormulaField( { deterministic: true } ),
      thickness: new FormulaField( { deterministic: true } ),
      width:     new FormulaField( { deterministic: true } ),
    };

    super( newFields, options );

    this._initFieldLocalizeKeys();

    this.fields.unit.choices = ED4E.movementUnits;
    this.fields.unit.initial = null;

    this.scalarConfig = ED4E.movementUnits;
    this.specialUnitKey = undefined;
  }

  _initFieldLocalizeKeys() {
    super._initFieldLocalizeKeys();

    this.fields.count.label = `${this.labelKey}.count`;
    this.fields.count.hint = `${this.hintKey}.count`;

    this.fields.type.label = `${this.labelKey}.type`;
    this.fields.type.hint = `${this.hintKey}.type`;

    this.fields.width.label = `${this.labelKey}.width`;
    this.fields.width.hint = `${this.hintKey}.width`;

    this.fields.height.label = `${this.labelKey}.height`;
    this.fields.height.hint = `${this.hintKey}.height`;
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /**
   * The default lang key for the object containing labels for the duration field.
   * @type {string}
   */
  get labelKey() {
    return "ED.Data.Fields.Labels.Area";
  }

  /**
   * The default lang key for the object containing hints for the duration field.
   * @type {string}
   */
  get hintKey() {
    return "ED.Data.Fields.Hints.Area";
  }

  /* -------------------------------------------- */
  /*  Form Support                                */
  /* -------------------------------------------- */

  /** @inheritDoc */
  _toInput( config ) {
    const inputs = document.createElement( "fieldset" );

    const legend = document.createElement( "legend" );
    legend.textContent = config.localize ? game.i18n.localize( this.label ) : this.label;
    inputs.appendChild( legend );

    const hint = document.createElement( "p" );
    hint.classList.add( "hint" );
    hint.textContent = config.localize ? game.i18n.localize( this.hint ) : this.hint;
    inputs.appendChild( hint );

    inputs.appendChild( this._getFieldFormGroup( "count", config ) );
    inputs.appendChild( this._getFieldFormGroup( "type", config ) );
    inputs.appendChild( this._getFieldFormGroup( "angle", { unit: "°", ...config } ) );
    inputs.appendChild( this._getFieldFormGroup( "height", config ) );
    inputs.appendChild( this._getFieldFormGroup( "length", config ) );
    inputs.appendChild( this._getFieldFormGroup( "radius", config ) );
    inputs.appendChild( this._getFieldFormGroup( "thickness", config ) );
    inputs.appendChild( this._getFieldFormGroup( "width", config ) );

    return inputs;
  }

  _getFieldFormGroup( field, config ) {
    return this.fields[field].toFormGroup( {
      label:    `${this.fields[field].label}`,
      hint:     `${this.fields[field].hint}`,
      unit:     config.unit,
      localize: config.localize ?? true,
    }, {
      name:     `${config.name}.${field}`,
      value:    config.value[field],
      required: true,
      localize: config.localize ?? true,
    } );
  }

}