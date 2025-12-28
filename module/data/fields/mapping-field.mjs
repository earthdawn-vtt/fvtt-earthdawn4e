const { setInputAttributes } = foundry.applications.fields;

/**
 * @callback MappingFieldInitialValueBuilder
 * @param {string} key       The key within the object where this new value is being generated.
 * @param {*} initial        The generic initial data provided by the contained model.
 * @param {object} existing  Any existing mapping data.
 * @returns {object}         Value to use as default for this key.
 */

/**
 * @template DataFieldOptions
 * @typedef {DataFieldOptions} MappingFieldOptions
 * @property {string[]} [initialKeys]       Keys that will be created if no data is provided.
 * @property {MappingFieldInitialValueBuilder} [initialValue]  Function to calculate the initial value for a key.
 * @property {boolean} [initialKeysOnly=false]  Should the keys in the initialized data be limited to the keys provided
 *                                              by `options.initialKeys`?
 */

/**
 * A subclass of ObjectField that represents a mapping of keys to the provided DataField type.
 * @param {DataField} model                    The class of DataField which should be embedded in this field.
 * @param {MappingFieldOptions} [options={}]   Options which configure the behavior of the field.
 * @property {string[]} [initialKeys]          Keys that will be created if no data is provided.
 * @property {MappingFieldInitialValueBuilder} [initialValue]  Function to calculate the initial value for a key.
 * @property {boolean} [initialKeysOnly=false]  Should the keys in the initialized data be limited to the keys provided
 *                                              by `options.initialKeys`?
 */
export default class MappingField extends foundry.data.fields.ObjectField {
  constructor( model, options ) {
    if ( !( model instanceof foundry.data.fields.DataField ) ) {
      throw new Error( "MappingField must have a DataField as its contained element" );
    }
    super( options );

    /**
     * The embedded DataField definition which is contained in this field.
     * @type {DataField}
     */
    this.model = model;
    model.parent = this;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  static get _defaults() {
    return foundry.utils.mergeObject( super._defaults, {
      initialKeys:     null,
      initialValue:    null,
      initialKeysOnly: false,
    } );
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _cleanType( value, options ) {
    // eslint-disable-next-line no-return-assign
    Object.entries( value ).forEach( ( [ k, v ] ) => value[k] = this.model.clean( v, options ) );
    return value;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  getInitialValue( data ) {
    let keys = this.initialKeys;
    const initial = super.getInitialValue( data );
    if ( !keys || !foundry.utils.isEmpty( initial ) ) return initial;
    if ( !( keys instanceof Array ) ) keys = Object.keys( keys );
    for ( const key of keys ) {
      initial[key] = this._getInitialValueForKey( key );
    }
    return initial;
  }

  /* -------------------------------------------- */

  /**
   * Get the initial value for the provided key.
   * @param {string} key      Key within the object being built.
   * @param {object} [object] Any existing mapping data.
   * @returns {*}              Initial value based on provided field type.
   */
  _getInitialValueForKey( key, object ) {
    const initial = this.model.getInitialValue();
    return this.initialValue?.( key, initial, object ) ?? initial;
  }

  /* -------------------------------------------- */

  /** @override */
  _validateType( value, options = {} ) {
    if ( foundry.utils.getType( value ) !== "Object" ) throw new Error( "Must be an Object" );
    const errors = this._validateValues( value, options );
    if ( !foundry.utils.isEmpty( errors ) ) {
      throw new foundry.data.validation.DataModelValidationError(
        Object.entries( errors ).map(
          ( [ k, _ ] ) => `\n${ k }: ${ errors[k].toString() }`
        ).join( "" )
      );
    }
  }

  /* -------------------------------------------- */

  /**
   * Validate each value of the object.
   * @param {object} value    The object to validate.
   * @param {object} options  Validation options.
   * @returns {{key: Error}} An object of value-specific errors by key.
   */
  _validateValues( value, options ) {
    const errors = {};
    for ( const [ k, v ] of Object.entries( value ) ) {
      const error = this.model.validate( v, options );
      if ( error ) errors[k] = error;
    }
    return errors;
  }

  /* -------------------------------------------- */

  /** @override */
  initialize( value, model, options = {} ) {
    if ( !value ) return value;
    const obj = {};
    const initialKeys = ( this.initialKeys instanceof Array ) ? this.initialKeys : Object.keys( this.initialKeys ?? {} );
    const keys = this.initialKeysOnly ? initialKeys : Object.keys( value );
    for ( const key of keys ) {
      const data = value[key] ?? this._getInitialValueForKey( key, value );
      obj[key] = this.model.initialize( data, model, options );
    }
    return obj;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _getField( path ) {
    if ( path.length === 0 ) return this;
    else if ( path.length === 1 ) return this.model;
    path.shift();
    return this.model._getField( path );
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _toInput( config ) {
    if ( !this.model.constructor.hasFormSupport ) return super._toInput( config );
    const { name, value } = config;
    const div = document.createElement( "div" );
    div.name = config.name;
    setInputAttributes( div, config );

    Object.entries( value ).forEach( ( [ fieldName, fieldValue ] ) => {
      const fieldInput = this.model.toInput( {
        ...config,
        name:  `${ name }.${ fieldName }`,
        value: fieldValue,
      } );
      div.appendChild( fieldInput );
    } );

    return div;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  toFormGroup( groupConfig={}, inputConfig={} ) {
    if ( groupConfig.widget instanceof Function ) return groupConfig.widget( this, groupConfig, inputConfig );
    groupConfig.label ??= this.label ?? this.fieldPath;
    groupConfig.hint ??= this.hint;
    let { hint, label, localize } = groupConfig;

    const fieldset = document.createElement( "fieldset" );

    const legend = document.createElement( "legend" );
    legend.textContent = localize ? game.i18n.localize( label ) : label;
    fieldset.appendChild( legend );
    if ( hint ) {
      const span = document.createElement( "p" );
      span.classList.add( "hint" );
      span.textContent = localize ? game.i18n.localize( hint ) : hint;
      fieldset.appendChild( span );
    }

    Object.entries( inputConfig.value ).forEach( ( [ fieldName, fieldValue ] ) => {
      const { units, input, rootId, classes, stacked, localize, widget } = groupConfig;
      const fieldGroup = this.model.toFormGroup(
        { input, localize, stacked, widget, rootId, classes, units },
        {
          ...inputConfig,
          name:  `${ name }.${ fieldName }`,
          value: fieldValue,
        } );
      fieldset.appendChild( fieldGroup );
    } );

    return fieldset;
  }

}