import EdRollOptions from "../../roll/common.mjs";
import SystemDataModel from "../../abstract/system-data-model.mjs";
import * as ACTIONS from "../../../config/actions.mjs";
import * as ITEMS from "../../../config/items.mjs";
import * as MAGIC from "../../../config/magic.mjs";
import * as ROLLS from "../../../config/rolls.mjs";
import { filterObject } from "../../../utils/object.mjs";

const { fields } = foundry.data;

/**
 * @import { RollableTemplateData } from "./_types.mjs";
 */

/**
 * Data model template for items that support rolling, with per-roll-type detail sub-schemas.
 * @augments {SystemDataModel<RollableTemplateData>}
 * @mixin
 * @see {@link RollableTemplateData} The system data model for this template.
 */
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
          ROLLS.rollTypes,
          ( key, _ ) => ![ "attribute", "attuning", "halfMagic" ].includes( key )
        ),
      } ),
      rollTypeDetails: new fields.SchemaField( {
        ability:       new fields.SchemaField( {}, {} ),
        attack:        new fields.SchemaField( {
          weaponItemStatus: new fields.SetField(
            new fields.StringField( {
              required: true,
              blank:    false,
              choices:  ITEMS.itemStatus,
            } ),
            {
              required: true,
              initial:  [],
            }
          ),
          weaponTypes: new fields.SetField(
            new fields.StringField( {
              required: true,
              blank:    false,
              initial:  "melee",
              choices:  ITEMS.weaponType,
            } ),
            {
              required: true,
              initial:  [ "melee", ],
            },
          ),
        } ),
        damage:        new fields.SchemaField( {
          combatType: new fields.SetField( new fields.StringField( {
            required: true,
            nullable: true,
            blank:    false,
            choices:  ITEMS.weaponType,
          } ), {
            required: true,
            initial:  [],
          } ),
        }, {} ),
        effect:        new fields.SchemaField( {}, {} ),
        initiative:    new fields.SchemaField( {}, {} ),
        reaction:      new fields.SchemaField( {
          defenseType: new fields.StringField( {
            required: true,
            nullable: true,
            blank:    true,
            initial:  "physical",
            choices:  ACTIONS.targetDifficulty,
          } ),
        } ),
        recovery:      new fields.SchemaField( {}, {} ),
        spellcasting:  new fields.SchemaField( {}, {} ),
        threadWeaving: new fields.SchemaField( {
          castingType: new fields.StringField( {
            required: false,
            nullable: true,
            blank:    false,
            trim:     true,
            initial:  null,
            choices:  MAGIC.spellcastingTypes,
          } ),
        }, {} ),
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
      ui.notifications.error( _loc( "ED.Notifications.Error.invalidRollType" ) );
    }
    return rollFunc();
  }

  // region Macros

  /** @inheritDoc */
  getDefaultMacroCommand( item, options = {} ) {
    if ( item.system?.roll instanceof Function ) {
      return `const item = await fromUuid("${this.parent.uuid}");\nawait item.system.roll()`;
    }
  }

  // endregion

}