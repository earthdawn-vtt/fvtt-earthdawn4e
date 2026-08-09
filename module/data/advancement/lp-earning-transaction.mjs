import LpTransactionData from "./lp-transaction.mjs";
import SystemDataModel from "../abstract/system-data-model.mjs";

/**
 * @import { LpEarningTransactionSystemData } from "./_types.mjs";
 */

/**
 * Data model for an LP earning transaction on an actor.
 * @augments {LpTransactionData<LpEarningTransactionSystemData>}
 * @see {@link LpEarningTransactionSystemData} The system data model for LP earning transaction data.
 */
export default class LpEarningTransactionData extends LpTransactionData {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.LpEarningTransaction",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return SystemDataModel.mergeSchema( super.defineSchema(), {
      type: new fields.StringField( {
        required: true,
        initial:  "earnings",
      } ),
    } );
  }

  /**
   * @inheritDoc
   */
  get displayString() {
    return _loc( "X.LP-Reward: ", this.amount );
  }


  /**
   * Get this transaction as an HTML `<tr>` row element in the LP tracking table.
   * @param {number} index     The index of the transaction in the earnings array.
   * @param {string[]} classes  Additional CSS classes for the row.
   * @param {string} dataGroup  The data group for the row.
   * @returns {string}         The HTML string for the row.
   */
  getHtmlRow( index, classes, dataGroup ) {
    return `
        <tr class="${ classes?.join( " " ) ?? "" }" data-group="${ dataGroup ?? "" }" data-id="${ this.id }">
          <td>
            <input name="earnings.${index}.date" type="datetime-local" value="${ this.constructor.dateToInputString( this.date ) }" data-dtype="String" />
          </td>
          <td>
            ${ this.schema.fields.description.toInput( {
    name:  `earnings.${index}.description`,
    value: this.description,
  } ).outerHTML }
          </td>
          <td>
            ${ this.schema.fields.amount.toInput( {
    name:  `earnings.${index}.amount`,
    value: this.amount,
  } ).outerHTML }
          </td>
        </tr>
      `;
  }
}