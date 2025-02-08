import ED4E from "../../config.mjs";
import { getLocalizeKey } from "../abstract.mjs";
import { validateEdid } from "../../utils.mjs";

/**
 * Taken from the ({@link https://gitlab.com/peginc/swade/-/wikis/Savage-Worlds-ID|SWADE system}).
 * A special case string field that represents a strictly slugged string.
 */
export default class EdIdField extends foundry.data.fields.StringField {

  /** @inheritdoc */
  static get _defaults() {
    return foundry.utils.mergeObject( super._defaults, {
      initial:  ED4E.reserved_edid.DEFAULT,
      blank:    false,
      required: true,
      label:    getLocalizeKey( "Item", false, "edid" ),
      hints:    getLocalizeKey( "Item", true, "edid" )
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
}