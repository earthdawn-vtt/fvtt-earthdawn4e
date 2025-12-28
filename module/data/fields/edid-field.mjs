import ED4E, { SYSTEM } from "../../config/_module.mjs";
import { getAllEdIds, validateEdid } from "../../utils.mjs";
import { getEdIds } from "../../settings.mjs";

/**
 * Taken from the ({@link https://gitlab.com/peginc/swade/-/wikis/Savage-Worlds-ID|SWADE system}).
 * A special case string field that represents a strictly slugged string.
 */
export default class EdIdField extends foundry.data.fields.StringField {

  // region Static Properties

  /** @inheritdoc */
  static get _defaults() {
    return foundry.utils.mergeObject( super._defaults, {
      initial:         ED4E.reservedEdid.DEFAULT,
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


  // endregion

  /**
   * @override
   */
  clean( value, options ) {
    const slug = value?.slugify( {strict: true,lowercase: true} );
    // only return slug if non-empty so empty slugs will be shown as errors
    return super.clean( slug ? slug : value, options );
  }

  /**
   * @override
   */
  _validateType( value, _ ) {
    return validateEdid( value );
  }

  /** @inheritdoc */
  _toInput( config ) {
    config.choices ??= [
      ...getAllEdIds( this.documentSubtype ),
      ...getEdIds(),
    ];
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

}