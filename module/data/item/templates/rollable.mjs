import SystemDataModel from "../../abstract.mjs";
import ED4E from "../../../config.mjs";
import EdRollOptions from "../../roll/common.mjs";
import { filterObject } from "../../../utils.mjs";

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
        choices:  filterObject(
          ED4E.rollTypes,
          ( key, _ ) => ![ "attribute", "halfmagic" ].includes( key )
        ),
        label:    this.labelKey( "Rollable.type" ),
        hint:     this.hintKey( "Rollable.type" )
      } ),
    } );
  }

  /**
   * @type {EdRollOptions}
   */
  get baseRollOptions() {
    if ( !this.isActorEmbedded ) return new EdRollOptions();

    return EdRollOptions.fromActor( { devotionRequired: !!this.devotionRequired }, this.parentActor );
  }

  async roll() {
    let rollFunc;
    switch ( this.rollType ) {
      case "ability": rollFunc = this.rollAbility.bind( this ); break;
      case "attack": rollFunc = this.rollAttack.bind( this ); break;
      case "damage": rollFunc = this.rollDamage.bind( this ); break;
      case "effect": rollFunc = this.rollEffect.bind( this ); break;
      case "initiative": rollFunc = this.rollInitiative.bind( this ); break;
      case "reaction": rollFunc = this.rollReaction.bind( this ); break;
      case "recovery": rollFunc = this.rollRecovery.bind( this ); break;
      case "spellcasting": rollFunc = this.rollSpellcasting.bind( this ); break;
      case "threadWeaving": rollFunc = this.rollThreadWeaving.bind( this ); break;
    }
    return rollFunc();
  }

}