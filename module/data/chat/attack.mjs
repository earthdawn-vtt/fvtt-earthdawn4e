import BaseMessageData from "./base-message.mjs";

export default class AttackMessageData extends BaseMessageData {


  static DEFAULT_OPTIONS = {
    actions: {
      "apply-effect":  this._onApplyEffect,
      "roll-damage":   this._onRollDamage,
      "maneuver":      this._onUseManeuver,
      "reaction":      this._onUseReaction,
    },
  };

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      // as value/max, so it can be used as like other resources, like an HTML meter element
      successes: new fields.SchemaField( {
        // available successes
        value: new fields.NumberField( {
          step:     1,
          initial:  0,
          integer:  true,
        } ),
        // num successes on the original roll
        max: new fields.NumberField( {
          step:     1,
          initial:  0,
          integer:  true,
        } )
      } ),
      successful: new fields.BooleanField( {} ),
    } );
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /**
   * The Actor that is attacking.
   * @type {Document | object | null}
   */
  get attacker() {
    return fromUuidSync( this.roll.options.rollingActorUuid );
  }

  /**
   * The targets of the attack.
   * @type {Set[ActorEd]}
   */
  get targets() {
    return this.roll.options.target.tokens.map( token => fromUuidSync( token ) );
  }

  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preCreate( data, options, user ) {
    if ( ( await super._preCreate( data, options, user ) ) === false ) return false;

    const roll = this.parent?.rolls[0];
    const updates = {};

    updates.successful = roll.isSuccess;
    updates.successes = {
      value: roll.numSuccesses,
      max:   roll.numSuccesses,
    };

    this.updateSource( updates );
  }


  /* -------------------------------------------- */
  /*  Listeners                                   */
  /* -------------------------------------------- */

  static async _onRollDamage( event, button ) {
    event.preventDefault();
    console.log( "In _onApplyDamage ChatMessage listener" );
    // update the damageDealt in the DataModel
    const weapon = await fromUuid( this.roll.options.weaponUuid );
    if ( weapon?.system.roll instanceof Function ) await weapon.system.rollDamage();
  }

  static async _onApplyEffect( event, button ) {
    event.preventDefault();
    console.log( "In _onApplyEffect ChatMessage listener" );
  }

  static async _onUseManeuver( event, button ) {
    event.preventDefault();
    ui.notifications.info( "Maneuvers are not done yet. We're working on it :)" );
    // update the number of successes in the DataModel
    /* console.log( "In _onUseManeuver ChatMessage listener" );
    const ability = await fromUuid( button.dataset.abilityUuid );
    console.log( "Ability: ", ability ); */
  }

  static async _onUseReaction( event, button ) {
    event.preventDefault();
    ui.notifications.info( "Reactions are not done yet. We're working on it :)" );
    // potentially update the success of the roll in the DataModel, e.g. with avoid blow
    /* console.log( "In _onUseReaction ChatMessage listener" );
    const ability = await fromUuid( button.dataset.abilityUuid );
    console.log( "Ability: ", ability ); */
  }

}