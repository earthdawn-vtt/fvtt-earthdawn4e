import LpEarningTransactionData from "./lp-earning-transaction.mjs";
import LpSpendingTransactionData from "./lp-spending-transaction.mjs";
import { sum } from "../../utils.mjs";

export default class LpTrackingData extends foundry.abstract.DataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.LpTracking",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      earnings: new fields.ArrayField(
        new fields.EmbeddedDataField( LpEarningTransactionData ),
        {
          required: true,
          nullable: false,
          initial:  [],
        } ),
      spendings: new fields.ArrayField(
        new fields.EmbeddedDataField( LpSpendingTransactionData ),
        {
          required: true,
          nullable: false,
          initial:  [],
        } ),
    };
  }

  /**
   * The legendary status of this actor based on their total earned LP.
   * @type {number} A number from 1 through 4 indicating their status.
   */
  get status() {
    let status = 0;
    if ( this.total <= 10000 ) {
      status = 1;
    } else if ( this.total > 10000 && this.total <= 100000 ) {
      status = 2;
    } else if ( this.total > 100000 && this.total <= 1000000 ) {
      status = 3;
    } else if ( this.total > 1000000 ) {
      status = 4;
    }
    return status;
  }

  /**
   *
   * @type {number}
   */
  get current() {
    return this.total - sum( this.spendings.map( spending => spending.amount ) );
  }

  /**
   *
   * @type {number}
   */
  get total() {
    return sum( this.earnings.map( earning => earning.amount ) );
  }

  /**
   * @description All transactions in chronological order.
   * @type {[LpTransactionData]}
   */
  get chronologically() {
    return this.earnings.concat( this.spendings ).sort( ( a, b ) => a.date - b.date );
  }

  /**
   * @description The HTML representing the LP earnings of this actor as a table.
   * @type {string}
   */
  get htmlEarnings() {
    return `
      <table class="input--centered">
        <thead>
          <tr>
            <th>
              ${ game.i18n.localize( "ED.Actor.LpTracking.Header.date" ) }
            </th>
            <th>
              ${ game.i18n.localize( "ED.Actor.LpTracking.Header.description" ) }
            </th>
            <th>
              ${ game.i18n.localize( "ED.Actor.LpTracking.Header.legendPoints" ) }
            </th>
          </tr>
        </thead>
        <tbody>
          ${
  this.earnings.map( ( earning, index ) => {
    return earning.getHtmlRow( index );
  } ).join( "\n" )
}
        </tbody>
      </table>
    `;
  }

  get htmlSpendingsByTime() {
    const rows = this.spendings.toSorted(
      ( a, b ) => a.date - b.date
    ).map( ( spending, index ) => {
      return spending.getHtmlRow( index );
    } );

    return this._getHtmlSpendingsTable(
      `<tbody>${ rows.join( "\n" ) }</tbody>`
    );
  }

  get htmlChronological() {
    const rows = this.chronologically.map( transaction => {
      return `
      <tr class="" data-group="" data-id="${ transaction.id }">
          <td>
             ${ ( new Date( transaction.date ) ).toLocaleDateString() }
          </td>
          <td>
            ${ game.i18n.localize( "ED.Dialogs.Legend.LpHistory." + transaction.type ) }
          </td>
          <td>
            ${ transaction.name ?? "" }
          </td>
          <td>
            ${ transaction.description }
          </td>
          <td>
            ${ transaction.amount }
          </td>
          <td>
            <i class="fas fa-rotate-left" data-action="revertTransactions" data-id="${ transaction.id }" style="visibility: hidden"></i>
          </td>
      </tr>
      `;
    } );

    return `
    <table class="input--centered">
        <thead>
          <tr>
            <th class="lp-history__date">
              ${ game.i18n.localize( "ED.Actor.LpTracking.Header.date" ) }
            </th>
            <th class="lp-history__type">
              ${ game.i18n.localize( "ED.Actor.LpTracking.Header.type" ) }
            </th>
            <th class="lp-history__name">
              ${ game.i18n.localize( "ED.Actor.LpTracking.Header.name" ) }
            </th>
            <th class="lp-history__description">
              ${ game.i18n.localize( "ED.Actor.LpTracking.Header.description" ) }
            </th>
            <th class="lp-history__amount">
              ${ game.i18n.localize( "ED.Actor.LpTracking.Header.legendPoints" ) }
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${ rows.join( "\n" ) }
        </tbody>
      </table>
    `;
  }

  /**
   * @description Creates the update data necessary to revert the transactions up to the specified transaction ID.
   *              If updated with this data, all transactions that appear chronologically after the specified
   *              transaction will be removed.
   * @param {string} transactionId - The ID of the transaction to revert to.
   * @returns {object}  An object containing the new earnings and spendings arrays.
   */
  revertUpdateData( transactionId ) {
    const newEndIndex = this.chronologically.findIndex(
      transaction => transaction.id === transactionId
    );
    const newTransactions = this.chronologically.slice( 0, newEndIndex );
    const newEarnings = newTransactions.filter( transaction => transaction.type === "earnings" );
    const newSpendings = newTransactions.filter( transaction => transaction.type === "spendings" );

    return {
      earnings:  newEarnings,
      spendings: newSpendings,
    };
  }

  /**
   * @description The HTML representing the LP spendings of this actor as a table.
   * @param { ("earnings" | "spendings" | "chronological") } type The type of table to return
   * @param { ("time" | "type" | "item") } sorting By what the table should be sorted
   * @returns {string} The HTML representing the table
   */
  getHtmlTable( type, sorting ) {
    switch ( type ) {
      case "earnings": return this._getHtmlEarnings( sorting );
      case "spendings": return this._getHtmlSpendings( sorting );
      case "chronological": return this._getHtmlChronological( sorting );
    }
  }

  _getHtmlEarnings( sorting ) {
    return this.htmlEarnings;
  }

  _getHtmlSpendings( sorting ) {
    switch ( sorting ) {
      case "time": return this.htmlSpendingsByTime;
      case "type": return this._getHtmlSpendingsGrouped( "entityType" );
      case "item": return this._getHtmlSpendingsGrouped( "name" );
    }
  }

  _getHtmlChronological( sorting ) {
    return this.htmlChronological;
  }

  _getHtmlSpendingsGrouped( categoryType ) {
    const groupedData = Object.groupBy(
      this.spendings.map(
        ( spending, index ) => {
          return {
            category:    spending[categoryType],
            transaction: spending,
            index,
          };
        }
      ),
      ( { category } ) => category
    );

    const content = Object.values( groupedData ).map(
      group => {
        const category = group[0]?.category;
        // Show raw category name when sorting by "item", but localized when sorting by "type"
        const displayCategory = categoryType === "name" 
          ? category 
          : game.i18n.localize( "ED.Dialogs.Legend.LpHistory." + category );
        return `
        <thead>
          <tr class="group-header" data-group="${category}" data-action="toggleDetail">
            <th colspan="5">${displayCategory}</th>
          </tr>
        </thead>
        <tbody class="group-body ${ sessionStorage.getItem( `ed4e.lpGroup.${category}` ) ?? "hidden" }" data-group="${category}">
          ${ group.map(
    ( { category, transaction, index } ) => transaction.getHtmlRow( index, [ "group-row" ], category )
  ).join( "\n" ) }        
        </tbody>
        `;
      }
    );

    return this._getHtmlSpendingsTable( content.join( "\n" ) );
  }

  _getHtmlSpendingsTable( tableBody ) {
    return `
      <table class="input--centered">
        <thead>
          <tr>
            <th class="lp-history__date">
              ${ game.i18n.localize( "ED.Actor.LpTracking.Header.date" ) }
            </th>
            <th class="lp-history__name">
              ${ game.i18n.localize( "ED.Actor.LpTracking.Header.name" ) }
            </th>
            <th class="lp-history__description">
              ${ game.i18n.localize( "ED.Actor.LpTracking.Header.description" ) }
            </th>
            <th class="lp-history__amount">
              ${ game.i18n.localize( "ED.Actor.LpTracking.Header.legendPoints" ) }
            </th>
          </tr>
        </thead>
        ${ tableBody }
      </table>
    `;
  }
}



