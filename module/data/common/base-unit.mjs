import FormulaField from "../fields/formula-field.mjs";
import { SparseDataModel } from "../abstract.mjs";
import AreaUnitData from "./area-unit.mjs";
import DurationUnitData from "./duration-unit.mjs";
import RangeUnitData from "./range-unit.mjs";

const fields = foundry.data.fields;

/**
 * Base model for storing data that have units which are possibly scalar (like duration or range).
 * Intended to be used as an inner EmbeddedDataField.
 * @property {string} value   Scalar value for the unit.
 * @property {string} unit    Unit that is used.
 * @property {string} special Description of any special unit details.
 * @abstract
 */
export default class BaseUnitData extends SparseDataModel {

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

  get scalarConfig() {
    return {};
  }

  get specialUnitKey() {
    return "spec";
  }

  get unitGroupOptions() {
    return {};
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

}