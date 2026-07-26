export default class RollTableEd extends foundry.documents.RollTable {

  /** @inheritdoc */
  roll( options = {} ) {
    if ( !( options.roll instanceof Roll ) ) options.roll = new foundry.dice.Roll( this.formula );
    return super.roll( options );
  }

}