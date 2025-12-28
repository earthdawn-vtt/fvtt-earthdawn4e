import ED4E from "../../../config/_module.mjs";
import EdRollOptions from "../../roll/common.mjs";
import { filterObject } from "../../../utils.mjs";
import SystemDataModel from "../../abstract/system-data-model.mjs";
import { SYSTEM_TYPES } from "../../../constants/constants.mjs";

const { fields } = foundry.data;

export default class RollableTemplate extends SystemDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Rollable",
  ];

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
          ( key, _ ) => ![ "attribute", "attuning", "halfmagic" ].includes( key )
        ),
      } ),
    } );
  }

  /**
   * @type {EdRollOptions}
   */
  get baseRollOptions() {
    if ( !this.isActorEmbedded ) return new EdRollOptions();

    return EdRollOptions.fromActor( { devotionRequired: !!this.devotionRequired }, this.containingActor );
  }

  async roll() {
    let rollFunc;
    switch ( this.rollType ) {
      case "ability": rollFunc = this.rollAbility.bind( this ); break;
      case "attack": rollFunc = this.rollAttack.bind( this ); break;
      case "damage": rollFunc = this.rollDamage.bind( this ); break;
      case "effect": rollFunc = this.rollEffect.bind( this ); break;
      case "initiative": rollFunc = this.rollAbility.bind( this ); break;
      case "knockdown": rollFunc = this.rollAbility.bind( this ); break;
      case "reaction": rollFunc = this.rollAbility.bind( this ); break;
      case "recovery": rollFunc = this.rollAbility.bind( this ); break;
      case "spellcasting": rollFunc = this.rollAbility.bind( this ); break;
      case "threadWeaving": rollFunc = this.rollAbility.bind( this ); break;
    }
    if ( !rollFunc ) {
      ui.notifications.error( game.i18n.localize( "ED.Notifications.Error.invalidRollType" ) );
    }
    return rollFunc();
  }

  // region Macros

  /** @inheritDoc */
  getDefaultMacroCommand( item, options = {} ) {
    const physicalItemTypes = [ SYSTEM_TYPES.Item.armor, SYSTEM_TYPES.Item.equipment, SYSTEM_TYPES.Item.shield, SYSTEM_TYPES.Item.weapon, ];
    if ( physicalItemTypes.includes( item.type ) ) {
      // Physical items have to use actor.rollEquipment() instead of item.system.roll()
      return `const item = await fromUuid("${this.parent.uuid}");\nawait item.actor.rollEquipment(item);`;
    } else {
      return `const item = await fromUuid("${this.parent.uuid}");\nawait item.system.roll()`;
    }
  }

  // endregion

}