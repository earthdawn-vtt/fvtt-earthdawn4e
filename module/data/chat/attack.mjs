import BaseMessageData from "./base-message.mjs";

export default class AttackMessageData extends BaseMessageData {


  static DEFAULT_OPTIONS = {
    actions: {
      "roll-damage": this._onApplyDamage.bind( this ),
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

}