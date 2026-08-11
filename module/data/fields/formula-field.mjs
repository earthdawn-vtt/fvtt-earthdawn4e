import { LoggerEd } from "../../logging/logger.mjs";

const logger = LoggerEd.getInstance();

/**
 * @typedef {StringFieldOptions} FormulaFieldOptions
 * @property {boolean} [deterministic=false]  Is this formula not allowed to have dice values?
 */

/**
 * Special case StringField which represents a formula.
 * @param {FormulaFieldOptions} [options={}]  Options which configure the behavior of the field.
 * @property {boolean} [deterministic=false]  Is this formula not allowed to have dice values?
 */
export default class FormulaField extends foundry.data.fields.StringField {

  // region Static Getters

  /** @inheritDoc */
  static get _defaults() {
    return foundry.utils.mergeObject( super._defaults, {
      deterministic: false
    } );
  }

  // endregion

  // region Static Methods

  /**
   * Evaluate a formula using a provided data object
   * @param {string} formula  The formula to evaluate
   * @param {object} data     The data object against which to evaluate the formula
   * @param {object} options  Additional options for {@link Roll#replaceFormulaData}
   * @returns {number}        The evaluated result
   */
  static evaluate( formula, data= {}, options={ warn: true, } ) {
    return Roll.safeEval(
      Roll.replaceFormulaData( formula, data , options )
    );
  }

  /**
   * Prepare the final formula value for a model field.
   * @param {ItemDataModel} model  Model for which the value is being prepared.
   * @param {string} keyPath                        Path to the field within the model.
   * @param {string} label                          Label to use in preparation warnings.
   * @param {object} rollData                       Roll data to use when replacing formula values.
   */
  static prepareFormulaValue( model, keyPath, label, rollData ) {
    const value = foundry.utils.getProperty( model, keyPath );
    if ( !value ) return;
    const item = model.item ?? model.parent;
    const property = _loc( label );
    try {
      const formula = this.replaceFormulaData( value, rollData, { item, property } );
      const roll = new Roll( formula );
      foundry.utils.setProperty( model, keyPath, roll.evaluateSync().total );
    } catch ( err ) {
      if ( item.isEmbedded ) {
        const message = _loc( "ED.Notifications.Error.formulaMalformedError", {
          property,
          name: model.name ?? item.name
        } );
        // item.actor._preparationWarnings.push( { message, link: item.uuid, type: "error" } );
        logger.error( message, err );
      }
    }
  }

  /**
   * Replace referenced data attributes in the roll formula with values from the provided data.
   * If the attribute is not found in the provided data, display a warning on the actor.
   * @param {string} formula           The original formula within which to replace.
   * @param {object} data              The data object that provides replacements.
   * @param {object} [options]         Options for the replacement process.
   * @param {ActorEd} [options.actor]            Actor for which the value is being prepared.
   * @param {ItemEd} [options.item]              Item for which the value is being prepared.
   * @param {string|null} [options.missing]  Value to use when replacing missing references, or `null` to not replace.
   * @param {string} [options.property]          Name of the property to which this formula belongs.
   * @returns {string}                 Formula with replaced data.
   */
  static replaceFormulaData( formula, data, { actor, item, missing = "0", property } = {} ) {
    const dataRgx = new RegExp( /@([a-z.0-9_-]+)/gi );
    const missingReferences = new Set();
    const newFormula = String( formula ).replace( dataRgx, ( match, term ) => {
      let value = foundry.utils.getProperty( data, term );
      if ( value === null || value === undefined ) {
        missingReferences.add( match );
        return missing ?? match[0];
      }
      return String( value ).trim();
    } );
    const newActor = actor ?? item?.parent;
    if ( ( missingReferences.size > 0 ) && newActor && property ) {
      const listFormatter = new Intl.ListFormat( game.i18n.lang, { style: "long", type: "conjunction" } );
      const message = _loc( "ED.Notifications.Error.formulaMissingReferenceWarn", {
        property, name: item?.name ?? newActor.name, references: listFormatter.format( missingReferences )
      } );
      newActor._preparationWarnings.push( { message, link: item?.uuid ?? newActor.uuid, type: "warning" } );
    }
    return newFormula;
  }

  // endregion

  // region Getters

  /**
   * The placeholder hint for this field.
   * @type {string}
   */
  get placeholderHint() {
    return "e.g. 2*@rank + @extras";
  }

  // endregion

  // region Validation

  /** @inheritDoc */
  _validateType( value ) {
    if ( this.options.deterministic ) {
      const roll = new Roll( value );
      if ( !roll.isDeterministic ) throw new Error( "must not contain dice terms" );
      Roll.safeEval( roll.formula );
    } else Roll.validate( value );
    super._validateType( value );
  }

  // endregion

  // region Rendering

  /** @inheritDoc */
  _toInput( config ) {
    config.placeholder ??= this.placeholderHint;
    return foundry.applications.elements.HTMLFormulaInputElement.create( config );
  }

  // endregion

}