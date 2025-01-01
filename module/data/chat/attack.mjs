import BaseMessageData from "./base-message.mjs";

export default class AttackMessageData extends BaseMessageData {


  static DEFAULT_OPTIONS = {
    actions: {
      "apply-effect":  this._onApplyEffect,
      "roll-damage":   this._onApplyDamage,
      "maneuver":      this._onUseManeuver,
      "reaction":      this._onUseReaction,
    },
  };

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      attacker: new fields.DocumentUUIDField( {
        required: false,
        nullable: true,
      } ),
      targets: new fields.ArrayField(
        new fields.DocumentUUIDField( {
          required: false,
          nullable: true,
        } ),
        {
          required: false,
          nullable: true,
        }
      ),
      damageDealt: new fields.NumberField( {
        required: false,
        nullable: true,
        min:      0,
        initial:  0,
      } ),
    } );
  }

  static async _onApplyDamage( event, button ) {
    event.preventDefault();
    console.log( "In _onApplyDamage ChatMessage listener" );
  }

  static async _onApplyEffect( event, button ) {
    event.preventDefault();
    console.log( "In _onApplyEffect ChatMessage listener" );
  }

  static async _onUseManeuver( event, button ) {
    event.preventDefault();
    ui.notifications.info( "Maneuvers are not done yet. We're working on it :)" );
    /* console.log( "In _onUseManeuver ChatMessage listener" );
    const ability = await fromUuid( button.dataset.abilityUuid );
    console.log( "Ability: ", ability ); */
  }

  static async _onUseReaction( event, button ) {
    event.preventDefault();
    ui.notifications.info( "Reactions are not done yet. We're working on it :)" );
    /* console.log( "In _onUseReaction ChatMessage listener" );
    const ability = await fromUuid( button.dataset.abilityUuid );
    console.log( "Ability: ", ability ); */
  }

}