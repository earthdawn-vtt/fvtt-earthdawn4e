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
            dealtTo: new fields.DocumentUUIDField( {
              type:  "Actor",
              label: this.labelKey( "Damage.Transactions.transaction.dealtTo" ),
              hint:  this.hintKey( "Damage.Transactions.transaction.dealtTo" ),
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

  static async _onApplyDamage( event, button ) {
    event.preventDefault();
    console.log( "Coming up: Apply Damage" );
  }

  static async _onTakeDamage( event, button ) {
    event.preventDefault();
    const targetActor = game.user.character;
    if ( !targetActor ) {
      ui.notifications.warn( "TODO: You must have an assigned character to take damage. Otherwise target tokens and use the 'applyDamage' button instead." );
      return;
    }

    const { damageTaken } = targetActor.takeDamage(
      this.roll.total,
      false,
      this.roll.options.damageType,
      this.roll.options.armorType,
      this.roll.options.ignoreArmor,
    );

    const transaction = {
      damage:  damageTaken,
      dealtTo: targetActor.uuid,
    };

    await this.parent.update( {
      system: {
        transactions: [ ...this.transactions, transaction ],
      },
    } );
  }

}