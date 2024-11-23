import UnitField from "./unit-field.mjs";
import ED4E from "../../config.mjs";

const { StringField } = foundry.data.fields;

export default class SpellEnhancementField extends UnitField {

  unitInputs = {
    area:     this._getStandardUnitInput.bind( this ),
    duration: this._getStandardUnitInput.bind( this ),
    effect:   this._getScalarOnlyInput.bind( this ),
    range:    this._getStandardUnitInput.bind( this ),
    section:  this._getScalarOnlyInput.bind( this ),
    special:  this._getSpecialInput.bind( this ),
    target:   this._getScalarOnlyInput.bind( this ),
  };

  constructor( fields={}, options={} ) {
    const newFields = {
      type: new StringField( {
        required: true,
        nullable: false,
        blank:    false,
        trim:     true,
        choices:  ED4E.spellEnhancements,
        initial:  "special",
      } ),
    };

    super( newFields, options );

    this._initFieldLocalizeKeys();

    this.fields.unit.choices = ED4E.spellEnhancementUnits;
    this.fields.unit.initial = null;
    this.unitGroupOptions = {
      "": ED4E.spellEnhancementUnits,
    };

    this.scalarConfig = ED4E.spellEnhancementUnits;
    this.specialUnitKey = "special";
  }

  _initFieldLocalizeKeys() {
    super._initFieldLocalizeKeys();

    this.fields.type.label = `${this.labelKey}.type`;
    this.fields.type.hint = `${this.hintKey}.type`;
  }

  _setUnitChoices( type ) {
    this.fields.unit.choices = ED4E[ED4E.spellEnhancements[type].unitConfig] ?? ED4E.spellEnhancementUnits;
    this.unitGroupOptions = {
      "": this.fields.unit.choices,
    };
  }

  /* -------------------------------------------- */
  /*  Data Field                                  */
  /* -------------------------------------------- */

  /** @override */
  clean( value, options = {} ) {
    const cleanedValue = super.clean( value, options );

    if ( value?.type ) this._setUnitChoices( value.type );
    if ( !( value?.unit in this.fields.unit.choices ) ) cleanedValue.unit = Object.keys( this.fields.unit.choices )[0];

    return cleanedValue;
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /**
   * The default lang key for the object containing labels for the duration field.
   * @type {string}
   */
  get labelKey() {
    return "ED.Data.Fields.Labels.SpellEnhancement";
  }

  /**
   * The default lang key for the object containing hints for the duration field.
   * @type {string}
   */
  get hintKey() {
    return "ED.Data.Fields.Hints.SpellEnhancement";
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

    const units = this.unitInputs[config.value.type]( config );
    units.appendChild( this.fields.type.toInput( {
      value:    config.value.type,
      required: true,
      localize: config.localize ?? true,
    } ) );

    inputs.appendChild( units );

    const result = document.createElement( "div" );
    result.classList.add( "form-fields" );
    result.appendChild( inputs );
    return inputs;
  }

  _getSpecialInput( config ) {
    const input = document.createElement( "div" );
    input.classList.add( "form-fields" );
    input.appendChild( this.fields.special.toInput( {
      value:    config.value.special,
      required: false,
      localize: config.localize ?? true,
    } ) );
    return input;
  }

  _getStandardUnitInput( config ) {
    return super._toInput( config );
  }

  _getScalarOnlyInput( config ) {
    const input = document.createElement( "div" );
    input.classList.add( "form-fields" );
    input.appendChild( this.fields.value.toInput( {
      value:    config.value.value,
      required: false,
      localize: config.localize ?? true,
    } ) );
    return input;
  }

}