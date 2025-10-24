import FormulaField from "../fields/formula-field.mjs";
import ED4E from "../../config/_module.mjs";
import SparseDataModel from "../abstract/sparse-data-model.mjs";

const fields = foundry.data.fields;


/**
 * Base model for storing data that have a value which is possibly scalar (like duration or range).
 * The value can be scalar or a formula and might have a unit.
 * Intended to be used as an inner EmbeddedDataField. Main purpose is to provide a common interface for
 * handling different types of spell/ability properties and their enhancements.
 * @property {string} value   Scalar value for the unit.
 * @property {string} unit    Unit that is used.
 * @property {string} special Description of any special unit details.
 * @abstract
 */
export class MetricData extends SparseDataModel {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    return {
      type: new fields.StringField( {
        required:        true,
        blank:           false,
        initial:         this.TYPE,
        validate:        value => value === this.TYPE,
        validationError: `must be equal to "${this.TYPE}"`,
      } ),
      value:   new FormulaField( {
        required:      true,
        nullable:      true,
        deterministic: true,
      } ),
      unit:   new fields.StringField( {
        required: true,
        nullable: true,
        blank:    false,
        trim:     true,
      } ),
      special: new fields.StringField()
    };
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.General.Metric",
  ];

  static get TYPES() {
    // eslint-disable-next-line no-return-assign
    return MetricData.#TYPES ??= Object.freeze( {
      [AreaMetricData.TYPE]:     AreaMetricData,
      [DurationMetricData.TYPE]: DurationMetricData,
      [EffectMetricData.TYPE]:   EffectMetricData,
      [RangeMetricData.TYPE]:    RangeMetricData,
      [SectionMetricData.TYPE]:  SectionMetricData,
      [SpecialMetricData.TYPE]:  SpecialMetricData,
      [TargetMetricData.TYPE]:   TargetMetricData,
    } );
  }

  static #TYPES;

  static TYPE = "";

  // endregion

  // region Static Methods

  static fromType( type, data = {} ) {
    const MetricClass = this.TYPES[type];
    if ( !MetricClass ) {
      throw new Error( `MetricData.createFromType: Unknown type "${type}"` );
    }
    return new MetricClass( data );
  }

  // endregion

  // region Getters

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

  get summaryString() {
    const summary = [
      `<em>${ED4E.spellEnhancements[this.constructor.TYPE].label}</em>`,
      "&emsp;",
    ];
    const localizedUnit = this.schema.fields.unit.options.choices?.[this.unit];
    if ( this.isScalarUnit && localizedUnit ) summary.push( `${this.value} ${localizedUnit}` );
    if ( this.isSpecialUnit && this.special ) summary.push( this.special );
    if ( localizedUnit ) summary.push( localizedUnit );
    if ( summary.length === 2 ) summary.push( game.i18n.localize( "ED.Data.placeholderBlankSelectOption" ) );
    return summary.join( " " );
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

  // endregion

  // region Methods

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

  // endregion

}


/**
 * Data model for storing area unit data.
 * @augments MetricData
 * @property {string} count     Number of areas.
 * @property {keyof ED4E.areaTargetDefinition} areaType  Type of area.
 * @property {string} angle     Angle of the area.
 * @property {string} height    Height of the area.
 * @property {string} length    Length of the area.
 * @property {string} radius    Radius of the area.
 * @property {string} thickness Thickness of the area.
 * @property {string} width     Width of the area.
 */
export class AreaMetricData extends MetricData {

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  static {
    Object.defineProperty( this, "TYPE", { value: "area" } );
  }

  get summaryString() {
    const summary = [
      `<em>${ED4E.spellEnhancements[this.constructor.TYPE].label}</em>`,
      "&emsp;",
    ];

    const areaType = ED4E.areaTargetDefinition[this.areaType];
    switch ( this.areaType ) {
      case "circle":
      case "radius":
      case "sphere":
        summary.push( `${areaType}: ${this.radius} ${this.unit}` );
        break;
      case "cone":
        summary.push( `${this.angle}° ${areaType.label}: ${this.radius} ${this.unit}` );
        break;
      case "cube":
      case "square":
        summary.push( `${areaType}: ${this.width} ${this.unit}` );
        break;
      case "cylinder":
        summary.push( `${areaType}: (r x h) ${this.radius} ${this.unit} x ${this.height} ${this.unit}` );
        break;
      case "line":
        summary.push( `${areaType}: (l x w) ${this.length} ${this.unit} x ${this.width} ${this.unit}` );
        break;
      case "wall":
        summary.push( `${areaType}: (l x w x t) ${this.length} ${this.unit} x ${this.width} ${this.unit} x ${this.thickness} ${this.unit}` );
        break;
      default:
        summary.push( game.i18n.localize( "ED.Data.placeholderBlankSelectOption" ) );
    }

    return summary.join( " " );
  }

  /* -------------------------------------------- */
  /*      Schema                                  */
  /* -------------------------------------------- */

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
      } ),
      count: new FormulaField( {
        deterministic: true,
      } ),
      areaType: new fields.StringField( {
        required: true,
        blank:    true,
        trim:     true,
        choices:  ED4E.areaTargetDefinition,
        initial:  "",
      } ),
      angle:  new fields.AngleField( ),
      height: new FormulaField( {
        deterministic: true,
      } ),
      length: new FormulaField( {
        deterministic: true,
      } ),
      radius: new FormulaField( {
        deterministic: true,
      } ),
      thickness: new FormulaField( {
        deterministic: true,
      } ),
      width: new FormulaField( {
        deterministic: true,
      } )
    } );
  }

}


/**
 * Data model for storing duration unit data.
 * @augments MetricData
 */
export class DurationMetricData extends MetricData {

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
 * Data model for storing effect metric data.
 * @augments MetricData
 */
export class EffectMetricData extends MetricData {

  static {
    Object.defineProperty( this, "TYPE", { value: "effect" } );
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  get isScalarUnit() {
    return true;
  }

}


/**
 * Data model for storing range unit data.
 * @augments MetricData
 */
export class RangeMetricData extends MetricData {

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


/**
 * Data model for storing section metric data.
 * @augments MetricData
 */
export class SectionMetricData extends MetricData {

  static {
    Object.defineProperty( this, "TYPE", { value: "section" } );
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  get isScalarUnit() {
    return true;
  }

}


/**
 * Data model for storing special metric data. This is used for special enhancement effects that can only be described textually.
 * @augments MetricData
 */
export class SpecialMetricData extends MetricData {

  static {
    Object.defineProperty( this, "TYPE", { value: "special" } );
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  get isSpecialUnit() {
    return true;
  }

}


/**
 * Data model for storing target (of spells or abilities) metric data.
 * @augments MetricData
 */
export class TargetMetricData extends MetricData {

  static {
    Object.defineProperty( this, "TYPE", { value: "target" } );
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  get isScalarUnit() {
    return true;
  }

}