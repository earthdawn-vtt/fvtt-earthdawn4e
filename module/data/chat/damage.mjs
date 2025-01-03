import BaseMessageData from "./base-message.mjs";

export default class DamageMessageData extends BaseMessageData {

  static DEFAULT_OPTIONS = {
    actions: {
      "apply-damage":  this._onApplyDamage,
      "take-damage":   this._onTakeDamage,
    },
  };

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      transactions: new fields.ArrayField(
        new fields.SchemaField(
          {
            damage: new fields.NumberField( {
              required: false,
              nullable: true,
              step:     1,
              min:      0,
              initial:  0,
              integer:  true,
              label:    this.labelKey( "Damage.Transactions.transaction.damage" ),
              hint:     this.hintKey( "Damage.Transactions.transaction.damage" ),
            } ),
            dealtBy: new fields.DocumentUUIDField( {
              type:  "Actor",
              label: this.labelKey( "Damage.Transactions.transaction.dealtBy" ),
              hint:  this.hintKey( "Damage.Transactions.transaction.dealtBy" ),
            } ),
          }, {
            label: this.labelKey( "Damage.Transactions.transaction" ),
            hint:  this.hintKey( "Damage.Transactions.transaction" ),
          } ),
        {
          initial: [],
          label:   this.labelKey( "Damage.transactions" ),
          hint:    this.hintKey( "Damage.transactions" ),
        }
      ),
    } );
  }

  /* -------------------------------------------- */
  /*  Listeners                                   */
  /* -------------------------------------------- */

  static async _onApplyDamage( event, button ) {}

  static async _onTakeDamage( event, button ) {}
}