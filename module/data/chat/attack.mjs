import BaseMessageData from "./base-message.mjs";

export default class AttackMessageData extends BaseMessageData {

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

}