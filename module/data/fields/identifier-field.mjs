/**
 * Special case StringField that includes automatic validation for identifiers.
 */
export default class IdentifierField extends foundry.data.fields.StringField {

  // region Static Methods

  /**
   * Ensure the provided string contains only the characters allowed in identifiers.
   * @param {string} identifier The string to be checked for validity
   * @returns {boolean} True, if the input string is a valid Foundry identifier, false otherwise.
   */
  static isValidIdentifier( identifier ){
    return /^([A-Za-z0-9_-]+)$/i.test( identifier );
  }

  // endregion

  /**
   * @override
   */
  _validateType( value ) {
    if ( !this.constructor.isValidIdentifier( value ) ) {
      throw new Error( game.i18n.localize( "ED.Notifications.Error.identifierError" ) );
    }
  }
}