import BaseMessageData from "./base-message.mjs";

export default class AttackMessageData extends BaseMessageData {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.General.AttackMessage",
  ];

  static DEFAULT_OPTIONS = {
    actions: {
      "apply-effect":  this._onApplyEffect,
      "roll-damage":   this._onRolldamage,
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

  // static async _onRollDamage( event, button ) {
  //   event.preventDefault();

  //   const weapon = await fromUuid( this.roll.options.weaponUuid );
  //   if ( weapon?.system.roll instanceof Function ) return await weapon.system.rollDamage();

  //   if ( this.roll.options.weaponType === "unarmed" ) return this.attacker.rollUnarmedDamage();
  // }
  static async _onRolldamage( event, button ) {
    event.preventDefault();
    let attackParameters = {
      weapon:     await fromUuid( this.roll.options.weaponUuid ) ?? null,
      weaponType: this.roll.options.weaponType ?? null,
      // powerType:  this.roll.options.powerType ?? null,
      // spellType:  this.roll.options.spellType ?? null,
      // armorType:  this...
      successes:  this.successes.value,
      armorType:  this.roll.options.armorType ?? null,
      
    };
    return this.attacker.damage( attackParameters );
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
    const ability = await fromUuid( event.srcElement.dataset.abilityUuid );
    // update the difficulty of the roll #654
    // update the original chat message success result #908
    return await ability.system.rollAbility();
  }

}