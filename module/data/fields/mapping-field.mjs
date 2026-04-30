const { setInputAttributes } = foundry.applications.fields;

/**
 * @callback MappingFieldInitialValueBuilder
 * @param {string} key       The key within the object where this new value is being generated.
 * @param {*} initial        The generic initial data provided by the contained element.
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
 * A subclass of TypedObjectField that adds functionality for initial keys and values.
 * @param {DataField} element               The value type of each entry in this object.
 * @param {MappingFieldOptions} [options]   Options which configure the behavior of the field.
 * @param {DataFieldContext} [context]      Additional context which describes the field.
 */
export default class MappingField extends foundry.data.fields.TypedObjectField {

  // region Static Properties

  /** @inheritDoc */
  static get _defaults() {
    return foundry.utils.mergeObject( super._defaults, {
      initialKeys:     null,
      initialValue:    null,
      initialKeysOnly: false,
    } );
  }

  // endregion

  // region Overrides

  /** @inheritDoc */
  initialize( value, element, options = {} ) {
    if ( !value ) return value;
    const initializedObject = {};
    const initialKeys = ( this.initialKeys instanceof Array ) ? this.initialKeys : Object.keys( this.initialKeys ?? {} );
    const keys = this.initialKeysOnly ? initialKeys : Object.keys( value );
    for ( const key of keys ) {
      const data = value[key] ?? this._getInitialValueForKey( key, value );
      initializedObject[key] = this.element.initialize( data, element, options );
    }
    return initializedObject;
  }

  /** @inheritDoc */
  _getField( path, options =  {} ) {
    if ( path.length === 0 ) return this;
    if ( game.release.generation < 14 ) path.shift();
    else path.pop();
    return this.element._getField( path, options );
  }

  // endregion

  // region Mapping Field methods

  /** @inheritDoc */
  getInitialValue( data ) {
    let keys = this.initialKeys;
    const initial = super.getInitialValue( data );
    if ( !keys || !foundry.utils.isEmpty( initial ) ) return initial;
    if ( !( keys instanceof Array ) ) keys = Object.keys( keys );
    for ( const key of keys ) initial[key] = this._getInitialValueForKey( key );
    return initial;
  }

  /**
   * Get the initial value for the provided key.
   * @param {string} key       Key within the object being built.
   * @param {object} [object]  Any existing mapping data.
   * @returns {*}              Initial value based on the provided field type.
   */
  _getInitialValueForKey( key, object ) {
    const initial = this.element.getInitialValue();
    return this.initialValue?.( key, initial, object ) ?? initial;
  }

  // endregion

  // region Rendering

  /** @inheritDoc */
  _toInput( config ) {
    if ( !this.element.constructor.hasFormSupport ) return super._toInput( config );
    const { name, value } = config;
    const div = document.createElement( "div" );
    div.name = config.name;
    setInputAttributes( div, config );

    Object.entries( value ).forEach( ( [ fieldName, fieldValue ] ) => {
      const fieldInput = this.element.toInput( {
        ...config,
        name:  `${ name }.${ fieldName }`,
        value: fieldValue,
      } );
      div.appendChild( fieldInput );
    } );

    return div;
  }

  /** @inheritDoc */
  toFormGroup( groupConfig={}, inputConfig={} ) {
    if ( groupConfig.widget instanceof Function ) return groupConfig.widget( this, groupConfig, inputConfig );
    groupConfig.label ??= this.label ?? this.fieldPath;
    groupConfig.hint ??= this.hint;
    let { hint, label, localize } = groupConfig;

    const fieldset = document.createElement( "fieldset" );

    const legend = document.createElement( "legend" );
    legend.textContent = localize ? _loc( label ) : label;
    fieldset.appendChild( legend );
    if ( hint ) {
      const span = document.createElement( "p" );
      span.classList.add( "hint" );
      span.textContent = localize ? _loc( hint ) : hint;
      fieldset.appendChild( span );
    }

    Object.entries( inputConfig.value ).forEach( ( [ fieldName, fieldValue ] ) => {
      const { units, input, rootId, classes, stacked, localize, widget } = groupConfig;
      const fieldGroup = this.element.toFormGroup(
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

  // endregion

}