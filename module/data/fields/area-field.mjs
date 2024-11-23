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
    const inputs = document.createElement( "div" );
    inputs.classList.add( "form-fields" );

    inputs.appendChild( this.fields.count.toInput( {
      name:        `${ config.name }.count`,
      value:       config.value.count,
      required:    true,
      localize:    config.localize ?? true,
      placeholder: "count",
    } ) );
    inputs.appendChild( this.fields.type.toInput( {
      name:     `${ config.name }.type`,
      value:    config.value.type,
      required: true,
      localize: config.localize ?? true,
    } ) );
    inputs.appendChild( this.fields.angle.toInput( {
      name:        `${ config.name }.angle`,
      value:       config.value.angle,
      required:    true,
      localize:    config.localize ?? true,
      placeholder: "angle",
    } ) );
    inputs.appendChild( this.fields.height.toInput( {
      name:        `${ config.name }.height`,
      value:       config.value.height,
      required:    true,
      localize:    config.localize ?? true,
      placeholder: "height",
    } ) );
    inputs.appendChild( this.fields.length.toInput( {
      name:        `${ config.name }.length`,
      value:       config.value.length,
      required:    true,
      localize:    config.localize ?? true,
      placeholder: "length",
    } ) );
    inputs.appendChild( this.fields.radius.toInput( {
      name:        `${ config.name }.radius`,
      value:       config.value.radius,
      required:    true,
      localize:    config.localize ?? true,
      placeholder: "radius",
    } ) );
    inputs.appendChild( this.fields.thickness.toInput( {
      name:        `${ config.name }.thickness`,
      value:       config.value.thickness,
      required:    true,
      localize:    config.localize ?? true,
      placeholder: "thickness",
    } ) );
    inputs.appendChild( this.fields.width.toInput( {
      name:        `${ config.name }.width`,
      value:       config.value.width,
      required:    true,
      localize:    config.localize ?? true,
      placeholder: "width",
    } ) );
    /* inputs.appendChild( document.createElement( "p" ).appendChild( this._getFieldFormGroup( "type", config ) ) );
    inputs.appendChild( document.createElement( "p" ).appendChild( this._getFieldFormGroup( "angle", { unit: "°", ...config } ) ) );
    inputs.appendChild( document.createElement( "p" ).appendChild( this._getFieldFormGroup( "height", config ) ) );
    inputs.appendChild( document.createElement( "p" ).appendChild( this._getFieldFormGroup( "length", config ) ) );
    inputs.appendChild( document.createElement( "p" ).appendChild( this._getFieldFormGroup( "radius", config ) ) );
    inputs.appendChild( document.createElement( "p" ).appendChild( this._getFieldFormGroup( "thickness", config ) ) );
    inputs.appendChild( document.createElement( "p" ).appendChild( this._getFieldFormGroup( "width", config ) ) ); */

    return inputs;
  }

}