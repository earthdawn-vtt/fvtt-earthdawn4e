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

  /** @inheritDoc */
  static get _defaults() {
    return foundry.utils.mergeObject( super._defaults, {
      deterministic: false
    } );
  }

  /* -------------------------------------------- */
  /* Properties                                   */
  /* -------------------------------------------- */

  get placeholderHint() {
    return "e.g. 2*@rank + @extras";
  }

  /* -------------------------------------------- */
  /* Cleaning & Validation                        */
  /* -------------------------------------------- */

  /** @inheritDoc */
  _validateType( value ) {
    if ( this.options.deterministic ) {
      const roll = new Roll( value );
      if ( !roll.isDeterministic ) throw new Error( "must not contain dice terms" );
      Roll.safeEval( roll.formula );
    } else Roll.validate( value );
    super._validateType( value );
  }

  /* -------------------------------------------- */
  /* Rendering                                    */
  /* -------------------------------------------- */

  /** @inheritDoc */
  _toInput( config ) {
    config.placeholder ??= this.placeholderHint;
    return super._toInput( config );
  }

  /* -------------------------------------------- */
  /* Evaluation                                   */
  /* -------------------------------------------- */

  /**
   * Evaluate a formula using a provided data object
   * @param {string} formula  The formula to evaluate
   * @param {object} data     The data object against which to evaluate the formula
   * @param {object} options  Additional options for {@link Roll#replaceFormulaData}
   * @returns {number}        The evaluated result
   */
  static evaluate( formula, data= {}, options={} ) {
    return Roll.safeEval(
      Roll.replaceFormulaData( formula, data , options )
    );
  }

}

