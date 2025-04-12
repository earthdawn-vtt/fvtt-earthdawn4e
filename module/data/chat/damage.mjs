import BaseMessageData from "./base-message.mjs";

export default class DamageMessageData extends BaseMessageData {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.General.DamageMessage",
  ];

  static DEFAULT_OPTIONS = {
    actions: {
      "apply-damage":  this._onApplyDamage,
      "take-damage":   this._onTakeDamage,
      "undo-damage":   this._onUndoDamage,
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
            timestamp: new fields.NumberField( {
              initial: new Date().valueOf(),
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

  // region Rendering

  /** @inheritdoc */
  async alterMessageHTML( html, context ) {
    const newHTML = await super.alterMessageHTML( html, context );
    const damageButtonsDiv = newHTML.querySelector( ".damage-roll-buttons" );
    damageButtonsDiv.parentNode.insertBefore( await this.getTransactionsHTML(), damageButtonsDiv.nextSibling );
    return newHTML;
  }

  async getTransactionsHTML() {
    const div = document.createElement( "div" );
    div.classList.add( "damage-transactions" );
    for ( let transaction of this.transactions ) {
      const dealtTo = await fromUuid( transaction.dealtTo );
      const dealtToName = dealtTo ? dealtTo.name : game.i18n.localize( "TODO.Unknown Actor" );
      const message = game.i18n.format( "ED.Chat.Flavor.actorTookDamage", { dealtTo: dealtToName } );

      const transactionDiv = document.createElement( "div" );
      transactionDiv.classList.add( "damage-transaction" );
      transactionDiv.textContent = message;

      const undoButton = document.createElement( "i" );
      undoButton.classList.add( "fa-light", "fa-undo" );
      undoButton.title = game.i18n.localize( "ED.Chat.Flavor.undoDamage" );
      undoButton.dataset.action = "undo-damage";
      undoButton.dataset.damageDealt = transaction.damage;
      undoButton.dataset.dealtTo = transaction.dealtTo;
      undoButton.dataset.txTimestamp = transaction.timestamp;

      transactionDiv.appendChild( undoButton );

      div.appendChild( transactionDiv );
    }

    return div;
  }

  // endregion

  // region Event Handlers

  static async _onApplyDamage( event, _ ) {
    event.preventDefault();

    const targets = Array.from( game.user.targets.map( target => target.document.actor ) );
    if ( targets.length === 0 ) {
      ui.notifications.warn( "TODO: You must target at least one token to apply damage." );
      return;
    }

    for ( let targetActor of targets ) {
      await this.applyDamage( targetActor );
    }
  }

  static async _onTakeDamage( event, _ ) {
    event.preventDefault();

    const targetActor = game.user.character;
    if ( !targetActor ) {
      ui.notifications.warn( "TODO: You must have an assigned character to take damage. Otherwise target tokens and use the 'applyDamage' button instead." );
      return;
    }

    await this.applyDamage( targetActor );
  }

  static async _onUndoDamage( event, button ) {
    event.preventDefault();
    const actor = await fromUuid( button.dataset.dealtTo );
    const actorDamageProperty = `system.characteristics.health.damage.${ this.roll.options.damageType }`;
    const newDamage = Math.max(
      0,
      foundry.utils.getProperty( actor, actorDamageProperty ) - Number( button.dataset.damageDealt )
    );
    await actor.update( { [ actorDamageProperty ]: newDamage } );
    const newTransactions = structuredClone( this.transactions );
    await this.parent.update( {
      system: {
        transactions: newTransactions.filter( tx =>
          !( tx.damage === Number( button.dataset.damageDealt )
          && tx.dealtTo === button.dataset.dealtTo
          && tx.timestamp === Number( button.dataset.txTimestamp ) )
        ),
      },
    } );
  }

  // endregion

  // region Methods

  /**
   * Apply damage to a target Actor and record the transaction.
   * @param {ActorEd} targetActor - The Actor to apply damage to
   */
  async applyDamage( targetActor ) {
    const { damageTaken } = targetActor.takeDamage( this.roll.total, {
      isStrain:     false,
      damageType:   this.roll.options.damageType,
      armorType:    this.roll.options.armorType,
      ignoreArmor:  this.roll.options.ignoreArmor,
      damageRoll:   this.roll,
    } );

    const transaction = {
      damage:    damageTaken,
      dealtTo:   targetActor.uuid,
      timestamp: new Date().valueOf()
    };

    await this.parent.update( {
      system: {
        transactions: [ ...this.transactions, transaction ]
      }
    } );
  }

  // endregion
}