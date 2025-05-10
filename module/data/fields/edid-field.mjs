import ED4E from "../../config/_module.mjs";
import { getLocalizeKey } from "../abstract.mjs";
import { getAllEdIds, validateEdid } from "../../utils.mjs";
import { getEdIds } from "../../settings.mjs";

/**
 * Taken from the ({@link https://gitlab.com/peginc/swade/-/wikis/Savage-Worlds-ID|SWADE system}).
 * A special case string field that represents a strictly slugged string.
 */
export default class EdIdField extends foundry.data.fields.StringField {

  /** @inheritdoc */
  static get _defaults() {
    return foundry.utils.mergeObject( super._defaults, {
      initial:         ED4E.reservedEdid.DEFAULT,
      blank:           false,
      required:        true,
      documentSubtype: "",
      label:           getLocalizeKey( "Item", false, "edid" ),
      hints:           getLocalizeKey( "Item", true, "edid" ),
    } );
  }

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