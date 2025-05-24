import AssignLpPrompt from "../../applications/advancement/assign-legend.mjs";

export default class LpTransactionData extends foundry.abstract.DataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.LpTransaction",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return  {
      id: new fields.StringField( {
        required: true,
        nullable: false,
        blank:    false,
        initial:  () => foundry.utils.randomID(),
      } ),
      type: new fields.StringField( {
        blank: false,
      } ),
      amount: new fields.NumberField( {
        required: true,
        initial:  0,
        min:      0,
        integer:  true,
      } ),
      date: new fields.NumberField( {
        required: true,
        initial:  Date.now,
      } ),
      description: new fields.StringField( {
        required: true,
        blank:    true,
        initial:  "",
      } ),
    };
  }

  /**
   * @description An automated description of this transaction.
   * @type {string}
   */
  get displayString() {
    throw new Error( `The ${this["name"]} subclass of LpTransactionData must define its displayString` );
  }

  getHtmlRow( index, classes, dataGroup ) {
    throw new Error( `The ${this["name"]} subclass of LpTransactionData must define its htmlRow` );
  }

  static async assignLpPrompt () {
    const transactionsPerUser = await AssignLpPrompt.waitPrompt();
    if ( !transactionsPerUser ) return;
    for ( const [ actorId, transactionData ] of Object.entries( transactionsPerUser ) ) {
      game.actors.get( actorId ).addLpTransaction( "earnings", transactionData );
    }
  }
}