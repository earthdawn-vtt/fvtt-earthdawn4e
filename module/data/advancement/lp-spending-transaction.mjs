import LpTransactionData from "./lp-transaction.mjs";
import SystemDataModel from "../abstract.mjs";
import { dateToInputString } from "../../utils.mjs";

export default class LpSpendingTransactionData extends LpTransactionData {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.LpSpendingTransaction",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return SystemDataModel.mergeSchema( super.defineSchema(), {
      type: new fields.StringField( {
        required: true,
        initial:  "spendings",
      } ),
      entityType: new fields.StringField( {
        required: true,
        blank:    false,
        label:    "X.transactionEntityType",
        hint:     "X.Type of the changed item",
      } ),
      name: new fields.StringField( {
        required: true,
        blank:    false,
        label:    "X.transactionEntityName",
        hint:     "X.Description of the changed item",
      } ),
      value: new fields.SchemaField( {
        before: new fields.NumberField( {
          required: true,
          initial:  null,
          min:      0,
          integer:  true,
          label:    "X.ChangedValueBefore",
          hint:     "X.The value of the corresponding entity before it was changed",
        } ),
        after: new fields.NumberField( {
          required: true,
          initial:  null,
          min:      0,
          integer:  true,
          label:    "X.ChangedValueAfter",
          hint:     "X.The value of the corresponding entity after it was changed",
        } ),
      } ),
      itemUuid: new fields.DocumentUUIDField(
        {
          label: "X.ItemDocumentReference",
          hint:  "X.Reference to the affected item, if applicable (no attributes)",
        }
      ),
    } );
  }

  /**
   * Creates data needed for a new spending transaction from an item with a level.
   * @param {ItemEd} item         The item to be leveled up,
   * @param {number} amount       The amount of LP spent,
   * @param {string} description  The description of the transaction.
   * @returns {{amount, entityType, name, description, value: {before, after: number}, itemUuid}}
   *  The data necessary for creating the LpTransaction.
   */
  static dataFromLevelItem( item, amount, description ) {
    return {
      amount,
      description,
      entityType:  item.type,
      name:       item.name,
      value:      {
        before: item.system.level,
        after:  item.system.level + 1,
      },
      itemUuid:   item.uuid,
    };
  }

  /**
   * @inheritDoc
   */
  getHtmlRow( index, classes, dataGroup ) {
    return `
        <tr class="${ classes?.join( " " ) ?? "" }" data-group="${ dataGroup ?? "" }" data-id="${ this.id }">
          <td class="lp-history__date">
            <input name="spendings.${ index }.date" type="datetime-local" value="${
  dateToInputString( this.date )
}" data-dtype="String" />
          </td>
          <input type="hidden" name="spendings.${ index }.entityType" value="${ this.entityType }" />
          <td class="lp-history__name">
            ${ this.schema.fields.name.toInput( {
    name:  `spendings.${ index }.name`,
    value: this.name,
  } ).outerHTML }
          </td>
          <td>
            ${ this.schema.fields.description.toInput( {
    name:    `spendings.${ index }.description`,
    value:   this.description,
    dataset: { index },
  } ).outerHTML }
          </td>
          <td>
            ${ this.schema.fields.amount.toInput( {
    name:  `spendings.${ index }.amount`,
    value: this.amount,
  } ).outerHTML }
          </td>
        </tr>
      `;
  }
}