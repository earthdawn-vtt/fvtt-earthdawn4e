import * as SYSTEM from "../../config/system.mjs";

/**
 * Taken from the ({@link https://gitlab.com/peginc/swade/-/wikis/Savage-Worlds-ID|SWADE system}).
 * A special case string field that represents a strictly slugged string.
 */
export default class EdIdField extends foundry.data.fields.StringField {

  // region Static Properties

  /** @inheritdoc */
  static get _defaults() {
    return foundry.utils.mergeObject( super._defaults, {
      initial:         SYSTEM.reservedEdid.DEFAULT,
      blank:           false,
      required:        true,
      documentSubtype: "",
    } );
  }

  // endregion

  // region Static Methods

  /**
   * Generates a default edid based on an item
   * @param {ItemEd|object} item The item or item-like object to generate the edid for.
   * @param {string} item.name The name of the item
   * @param {string} item.type The document subtype of the item
   * @returns {string} A generated edid in the form type-name (e.g. "armor-padded-leather"). If the item is missing,
   * returns the default reserved edid from {@link SYSTEM.reservedEdid.DEFAULT}.
   */
  static generateEdId( item ) {
    if ( !item?.name || !item?.type ) return SYSTEM.reservedEdid.DEFAULT;
    return `${ item.type } - ${ item.name }`.slugify( {
      strict:    true,
      lowercase: true,
    } );
  }

  /**
   * Taken from the ({@link https://gitlab.com/peginc/swade/-/wikis/Savage-Worlds-ID|SWADE system}).
   * Ensure the provided string is a valid earthdawn id (a strictly slugged string).
   * @param { string }  value The string to be checked for validity
   * @returns {void|DataModelValidationFailure} A validation failure in case of an invalid value.
   */
  static validateEdid( value ) {
    // `any` is a reserved word
    if ( value === SYSTEM.reservedEdid.ANY ) {
      return new foundry.data.validation.DataModelValidationFailure( {
        unresolved:   true,
        invalidValue: value,
        message:      "any is a reserved EDID!"
      } );
    }
    // if the value matches the regex we have likely a valid edid
    if ( !value.match( SYSTEM.SLUG_REGEX ) ) {
      return new foundry.data.validation.DataModelValidationFailure( {
        unresolved:   true,
        invalidValue: value,
        message:      value + " is not a valid EDID"
      } );
    }
  }

  // endregion

  // region Rendering

  /** @inheritdoc */
  _toInput( config ) {
    config.choices ??= game.ed4e.edIdsByType[ this.documentSubtype || "all" ];
    config.dataset ??= {};
    config.dataset.tooltip ??= game.i18n.localize( "ED.Data.Fields.Tooltips.edid" );

    const listId = `${config.id ?? ""}-edid.list`;
    const textInput = foundry.applications.fields.createTextInput( config );
    textInput.setAttribute( "list", listId );
    const datalist = document.createElement( "datalist" );
    datalist.id = listId;
    datalist.append( ...config.choices.map( choice => {
      const option = document.createElement( "option" );
      option.value = choice;
      option.text = choice;
      return option;
    } ) );

    const result = document.createElement( "div" );
    result.append( textInput, datalist );
    return result;
  }

  // endregion

  // region Methods

  /** @inheritDoc */
  clean( value, options ) {
    const slug = value?.slugify( {strict: true,lowercase: true} );
    // only return slug if non-empty so empty slugs will be shown as errors
    return super.clean( slug ? slug : value, options );
  }

  /** @inheritDoc */
  _validateType( value, _ ) {
    return this.constructor.validateEdid( value );
  }

  // endregion

}