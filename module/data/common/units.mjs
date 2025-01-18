import FormulaField from "../fields/formula-field.mjs";
import { SparseDataModel } from "../abstract.mjs";
import ED4E from "../../config.mjs";

const fields = foundry.data.fields;


/**
 * Base model for storing data that have units which are possibly scalar (like duration or range).
 * Intended to be used as an inner EmbeddedDataField.
 * @property {string} value   Scalar value for the unit.
 * @property {string} unit    Unit that is used.
 * @property {string} special Description of any special unit details.
 * @abstract
 */
export class BaseUnitData extends SparseDataModel {

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  static get TYPES() {
    // eslint-disable-next-line no-return-assign
    return BaseUnitData.#TYPES ??= Object.freeze( {
      [AreaUnitData.TYPE]:     AreaUnitData,
      [DurationUnitData.TYPE]: DurationUnitData,
      [RangeUnitData.TYPE]:    RangeUnitData,
    } );
  }

  static #TYPES;

  static TYPE = "";

  /* -------------------------------------------- */
  /*      Schema                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static defineSchema() {
    return {
      type: new fields.StringField( {
        required:        true,
        blank:           false,
        initial:         this.TYPE,
        validate:        value => value === this.TYPE,
        validationError: `must be equal to "${this.TYPE}"`,
        label:           this.labelKey( "BaseUnit.type" ),
        hint:            this.hintKey( "BaseUnit.type" ),
      } ),
      value:   new FormulaField( {
        required:      true,
        nullable:      true,
        deterministic: true,
        label:         this.labelKey( "BaseUnit.value" ),
        hint:          this.hintKey( "BaseUnit.value" ),
      } ),
      unit:   new fields.StringField( {
        required: true,
        nullable: true,
        blank:    false,
        trim:     true,
        label:    this.labelKey( "BaseUnit.unit" ),
        hint:     this.hintKey( "BaseUnit.unit" ),
      } ),
      special: new fields.StringField( {
        label: this.labelKey( "BaseUnit.special" ),
        hint:  this.hintKey( "BaseUnit.special" ),
      } )
    };
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  get isScalarUnit() {
    return this.unit in this.scalarConfig;
  }

  get isSpecialUnit() {
    return this.unit === this.specialUnitKey;
  }

  get scalarConfig() {
    return {};
  }

  get specialUnitKey() {
    return "spec";
  }

  get unitGroupOptions() {
    return {};
  }

  /**
   * Get the unit select input options for this field.
   * @type {[]} - The choices of the unit field as select options.
   * @protected
   */
  get unitOptions() {

    const unitOptions = [];
    for ( const [ group, options ] of Object.entries( this.unitGroupOptions ) ) {
      unitOptions.push( ...( this._getSelectOptionsConfig(
        options,
        group
      ) ) );
    }

    return unitOptions;
  }

  /* -------------------------------------------- */
  /*  Helper                                      */
  /* -------------------------------------------- */

  /**
   * Get select options for a given enum to be used in {@link createSelectInput}.
   * @param {Record<string,string>} configEnum - The enum to get select options for as used in ED4E config.
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
        rule:     false,
      };
    } );
  }

}


/**
 * Data model for storing area unit data.
 * @augments BaseUnitData
 * @property {string} count     Number of areas.
 * @property {keyof ED4E.areaTargetDefinition} areaType  Type of area.
 * @property {string} angle     Angle of the area.
 * @property {string} height    Height of the area.
 * @property {string} length    Length of the area.
 * @property {string} radius    Radius of the area.
 * @property {string} thickness Thickness of the area.
 * @property {string} width     Width of the area.
 */
export class AreaUnitData extends BaseUnitData {

  static {
    Object.defineProperty( this, "TYPE", { value: "area" } );
  }

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      unit: new fields.StringField( {
        required: true,
        nullable: true,
        blank:    false,
        trim:     true,
        choices:  ED4E.movementUnits,
        initial:  null,
        label:    this.labelKey( "AreaUnit.unit" ),
        hint:     this.hintKey( "AreaUnit.unit" )
      } ),
      count: new FormulaField( {
        deterministic: true,
        label:         this.labelKey( "AreaUnit.count" ),
        hint:          this.hintKey( "AreaUnit.count" )
      } ),
      areaType: new fields.StringField( {
        required: true,
        blank:    true,
        trim:     true,
        choices:  ED4E.areaTargetDefinition,
        initial:  "",
        label:    this.labelKey( "AreaUnit.areaType" ),
        hint:     this.hintKey( "AreaUnit.areaType" )
      } ),
      angle: new fields.AngleField( {
        label:         this.labelKey( "AreaUnit.angle" ),
        hint:          this.hintKey( "AreaUnit.angle" )
      } ),
      height: new FormulaField( {
        deterministic: true,
        label:         this.labelKey( "AreaUnit.height" ),
        hint:          this.hintKey( "AreaUnit.height" )
      } ),
      length: new FormulaField( {
        deterministic: true,
        label:         this.labelKey( "AreaUnit.length" ),
        hint:          this.hintKey( "AreaUnit.length" )
      } ),
      radius: new FormulaField( {
        deterministic: true,
        label:         this.labelKey( "AreaUnit.radius" ),
        hint:          this.hintKey( "AreaUnit.radius" )
      } ),
      thickness: new FormulaField( {
        deterministic: true,
        label:         this.labelKey( "AreaUnit.thickness" ),
        hint:          this.hintKey( "AreaUnit.thickness" )
      } ),
      width: new FormulaField( {
        deterministic: true,
        label:         this.labelKey( "AreaUnit.width" ),
        hint:          this.hintKey( "AreaUnit.width" )
      } )
    } );
  }

}


/**
 * Data model for storing duration unit data.
 */
export class DurationUnitData extends BaseUnitData {

  static {
    Object.defineProperty( this, "TYPE", { value: "duration" } );
  }

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      unit: new fields.StringField( {
        required: true,
        nullable: true,
        blank:    false,
        trim:     true,
        choices:  ED4E.timePeriods,
        initial:  "inst",
        label:    this.labelKey( "DurationUnit.unit" ),
        hint:     this.hintKey( "DurationUnit.unit" )
      } )
    } );
  }

  /* -------------------------------------------- */
  /*  Properties                                  */

  /* -------------------------------------------- */

  get scalarConfig() {
    return ED4E.scalarTimePeriods;
  }

  get unitGroupOptions() {
    return {
      "":                                                   ED4E.specialTimePeriods,
      "ED.Data.Fields.Options.Duration.groupScalarTime":    ED4E.scalarTimePeriods,
      "ED.Data.Fields.Options.Duration.groupPermanentTime": ED4E.permanentTimePeriods
    };
  }

}


/**
 * Data model for storing range unit data.
 */
export class RangeUnitData extends BaseUnitData {

  static {
    Object.defineProperty( this, "TYPE", { value: "range" } );
  }

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      unit: new fields.StringField( {
        required: true,
        nullable: true,
        blank:    false,
        trim:     true,
        choices:  ED4E.distanceUnits,
        initial:  "any",
        label:    this.labelKey( "RangeUnit.unit" ),
        hint:     this.hintKey( "RangeUnit.unit" )
      } )
    } );
  }

  /* -------------------------------------------- */
  /*  Properties                                  */

  /* -------------------------------------------- */

  get scalarConfig() {
    return ED4E.movementUnits;
  }

  get unitGroupOptions() {
    return {
      "":                                                ED4E.rangeTypes,
      "ED.Data.Fields.Options.Range.groupMovementUnits": ED4E.movementUnits
    };
  }

}
