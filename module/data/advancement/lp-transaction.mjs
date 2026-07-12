import AssignLpPrompt from "../../applications/advancement/assign-legend.mjs";

/**
 * @import { LpTransactionSystemData } from "./_types.mjs";
 */

/**
 * Abstract base data model for an LP (Legend Points) transaction on an actor.
 * @augments {foundry.abstract.DataModel<LpTransactionSystemData>}
 * @see {@link LpTransactionSystemData} The system data model for LP transaction data.
 */
export default class LpTransactionData extends foundry.abstract.DataModel {

  // region Schema

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

  // endregion

  // region Static Methods

  /**
   * @description Converts a date object or integer to a string that can be used as value in a datetime input field.
   * @param { Date | integer } date The date to be converted. If integer, it is treated as a timestamp.
   * @returns { string } The date string in the format "YYYY-MM-DDTHH:MM".
   */
  static dateToInputString( date ) {
    return ( new Date( date ) ).toISOString().substring( 0, 16 );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.LpTransaction",
  ];

  // endregion

  // region Getters

  /**
   * @description An automated description of this transaction.
   * @type {string}
   */
  get displayString() {
    throw new Error( `The ${this["name"]} subclass of LpTransactionData must define its displayString` );
  }

  // endregion

  // region Rendering

  getHtmlRow( index, classes, dataGroup ) {
    throw new Error( `The ${this["name"]} subclass of LpTransactionData must define its htmlRow` );
  }

  // endregion

  static async assignLpPrompt () {
    const transactionsPerUser = await AssignLpPrompt.waitPrompt();
    if ( !transactionsPerUser ) return;
    for ( const [ actorId, transactionData ] of Object.entries( transactionsPerUser ) ) {
      game.actors.get( actorId ).addLpTransaction( "earnings", transactionData );
    }
  }
}