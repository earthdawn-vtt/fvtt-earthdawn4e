import { prepareFormulaValue } from "../../utils.mjs";
import FormulaField from "./formula-field.mjs";

const { SchemaField, StringField } = foundry.data.fields;

/**
 * Field for storing duration data.
 * @property {string} value             Scalar value for the activity's duration.
 * @property {string} units             Units that are used for the duration.
 * @property {string} special           Description of any special duration details.
 */
export default class DurationField extends SchemaField {
  constructor( fields={}, options={} ) {
    const newFields = {
      /* value:   new SchemaField( {
        type: new StringField( {
          required: true,
          nullable: false,
          blank:    false,
          trim:     true,
          choices:  ED4E.formulaValueTypes,
          label:    "ED.Data.Fields.Labels.Duration.valueType",
          hint:     "ED.Data.Fields.Hints.Duration.valueType",
        } ),
        numeric: new NumberField( {
          required: true,
          nullable: true,
          initial:  0,
          integer:  true,
          label:    "ED.Data.Fields.Labels.Duration.numericValue",
          hint:     "ED.Data.Fields.Hints.Duration.numericValue",
        } ),
        attribute: new StringField( {
          required: true,
          nullable: true,
          blank:    false,
          trim:     true,
          choices:  mapObject(
            ED4E.attributes,
            ( key, label ) => [ key, label["abbreviation"] ]
          ),
          label:    "ED.Data.Fields.Labels.Duration.attribute",
          hint:     "ED.Data.Fields.Hints.Duration.attribute",
        } ),
        rank:    new DocumentUUIDField(
          {
            type:     "Item",
            embedded: true,
            validate: ( value, _ ) => {
              if (
                fromUuidSync( value, {strict: false} )?.system instanceof AbilityTemplate
              ) return undefined; // undefined means do further validation
              else return false;
            },
            validationError: "must be an ability",
            label:           "ED.Data.Fields.Labels.Duration.rank",
            hint:            "ED.Data.Fields.Hints.Duration.rank",
          } ),
        special: new StringField( {
          nullable: true,
          blank:    true,
          trim:     false,
          label:    "ED.Data.Fields.Labels.Duration.special",
          hint:     "ED.Data.Fields.Hints.Duration.special",
        } ),
      } ), */
      value:   new FormulaField( { deterministic: true } ),
      units:   new StringField( { initial: "inst" } ),
      special: new StringField(),
      ...fields
    };
    super( newFields, options );
  }

  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */

  /**
   * Prepare data for this field. Should be called during the `prepareFinalData` stage.
   * @this {ItemDataModel}
   * @param {object} rollData  Roll data used for formula replacements.
   * @param {object} [labels]  Object in which to insert generated labels.
   */
  static prepareData( rollData, labels ) {
    this.duration.scalar = this.duration.units in CONFIG.ED4E.scalarTimePeriods;
    if ( this.duration.scalar ) {
      prepareFormulaValue( this, "duration.value", "DND5E.DURATION.FIELDS.duration.value.label", rollData );
    } else this.duration.value = null;

    if ( labels && this.duration.units ) {
      let duration = CONFIG.ED4E.timePeriods[this.duration.units] ?? "";
      if ( this.duration.value ) duration = `${this.duration.value} ${duration.toLowerCase()}`;
      labels.duration = duration;
      // TODO: Allow activities to indicate they require concentration regardless of the base item
      labels.concentrationDuration = this.properties?.has( "concentration" )
        ? game.i18n.format( "ED4E.Data.Fields.DurationField.concentrationDuration", { duration } ) : duration;
    }

    Object.defineProperty( this.duration, "getEffectData", {
      value:        DurationField.getEffectDuration.bind( this.duration ),
      configurable: true
    } );
  }

  /* -------------------------------------------- */

  /**
   * Create duration data usable for an active effect based on this duration.
   * @this {DurationData}
   * @returns {EffectDurationData}
   */
  static getEffectDuration() {
    if ( !Number.isNumeric( this.value ) ) return {};
    switch ( this.units ) {
      case "turn": return { turns: this.value };
      case "round": return { rounds: this.value };
      case "minute": return { seconds: this.value * 60 };
      case "hour": return { seconds: this.value * 60 * 60 };
      case "day": return { seconds: this.value * 60 * 60 * 24 };
      case "year": return { seconds: this.value * 60 * 60 * 24 * 365 };
      default: return {};
    }
  }
}
