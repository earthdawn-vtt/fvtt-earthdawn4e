/**
 * Custom Users collection class for Earthdawn.
 */
export default class UsersEd extends foundry.documents.collections.Users {

  // Properties

  /**
   * Get all characters assigned to active users.
   * @type {ActorEd[]}
   */
  get assignedCharacters() {
    return this.reduce( ( assigned, user ) => {
      if ( user.character ) assigned.push( user.character );
      return assigned;
    }, [] );
  }

  // endregion

}