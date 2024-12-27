import SystemDataModel from "../../abstract.mjs";
import ED4E from "../../../config.mjs";

const { fields } = foundry.data;

export default class RollableTemplate extends SystemDataModel {

  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
      rollType: new fields.StringField( {
        required: false,
        nullable: true,
        blank:    true,
        initial:  "",
        choices:  ED4E.rollTypes,
        label:    this.labelKey( "Rollable.type" ),
        hint:     this.hintKey( "Rollable.type" )
      } ),
    } );
  }

  async roll() {
    let rollFunc;
    switch ( this.rollType ) {
      case "ability": rollFunc = this.rollAbility; break;
      case "attack": rollFunc = this.rollAttack; break;
      case "damage": rollFunc = this.rollDamage; break;
      case "effect": rollFunc = this.rollEffect; break;
      case "initiative": rollFunc = this.rollInitiative; break;
      case "reaction": rollFunc = this.rollReaction; break;
      case "recovery": rollFunc = this.rollRecovery; break;
      case "spellcasting": rollFunc = this.rollSpellcasting; break;
      case "threadWeaving": rollFunc = this.rollThreadWeaving; break;
    }
    return rollFunc();
  }

}