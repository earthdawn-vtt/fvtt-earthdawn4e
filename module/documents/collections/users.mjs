export default class UsersEd extends foundry.documents.collections.Users {

  // Properties

  get assignedCharacters() {
    return this.reduce( ( assigned, user ) => {
      if ( user.character ) assigned.push( user.character );
      return assigned;
    }, [] );
  }

  // endregion

}