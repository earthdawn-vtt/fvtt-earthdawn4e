/**
 * Special case StringField that includes automatic validation for 16 character UIDs.
 */
export default class UIDField extends foundry.data.fields.StringField {

  /**
   * @inheritDoc
   */
  _validateType( value ) {
    if ( !foundry.data.validators.isValidId( value ) ) {
      throw new Error( game.i18n.localize( "ED.Notifications.Error.identifierError" ) );
    }
  }

}