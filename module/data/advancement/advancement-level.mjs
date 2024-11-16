import { SparseDataModel } from "../abstract.mjs";
import ED4E from "../../config.mjs";
import AbilityTemplate from "../item/templates/ability.mjs";
import MappingField from "../fields/mapping-field.mjs";
import IdentifierField from "../fields/identifier-field.mjs";

/**
 * A level in an advancement.
 */
export default class AdvancementLevelData extends SparseDataModel {

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      identifier: new IdentifierField( {
        required: true,
        nullable: false,
        label:    "ED.identifier",
        hint:     "ED.data.hints.ClearIdentifierForThis"
      } ),
      level: new fields.NumberField( {
        required: true,
        nullable: false,
        step:     1,
        positive: true,
        initial:  1,
        label:    "ED.level",
        hint:     "ED.TheLevelThisAdvancementDescribes"
      } ),
      tier: new fields.StringField( {
        required: true,
        nullable: true,
        blank:    true,
        initial:  "",
        choices:  ED4E.tier,
        label:    "ED.tier",
        hint:     "ED.The tier to which this level belongs to"
      } ),
      abilities: new MappingField(
        new fields.SetField(
          new fields.DocumentUUIDField(
            AbilityTemplate,
            {
              label: "ED.Ability",
              hint:  "ED.AnAbilityGrantedOnThisLevel"
            }
          ),
          {
            required: true,
            empty:    true,
            initial:  [],
            label:    "ED.advancement.abilityPoolLevel",
            hint:     "ED.TheSetOfAbilitiesGrantedOnThisLevel"
          }
        ),
        {
          initialKeys:     CONFIG.ED4E.abilityPools,
          initialKeysOnly: true,
          required:        true,
          nullable:        false,
          label:           "ED.advancement.levelAbilities",
          hint:            "good stoff"
        }
      ),
      effects: new fields.SetField(
        new fields.DocumentUUIDField(
          ActiveEffect,
          {
            label: "ED.ActiveEffect",
            hint:  "ED.AnActiveEffectGrantedOnThisLevel"
          }
        ),
        {
          required: true,
          empty:    true,
          initial:  [],
          label:    "ED.advancement.levelActiveEffects",
          hint:     "ED.TheSetOfActiveAbilitiesGrantedOnThisLevel"
        }
      ),
      resourceStep: new fields.NumberField( {
        required: true,
        nullable: false,
        step:     1,
        min:      1,
        positive: true,
        initial:  this.initResourceStep,
        label:    "ED.advancement.levelResourceStep",
        hint:     "ED.advancement.hintLevelResourceStep",
      } ),
    };
  }
  
  /**
   * Add abilities to the given type of pool on this level.
   * @param {[Item]} abilities              An array of ability item IDs to add.
   * @param {ED4E.abilityPools} poolType    The type of pool the abilities are added to.
   */
  addAbilities( abilities, poolType ) {
    const propertyKey = `system.advancement.levels.${this.level-1}.abilities`;
    const currentAbilities = this.abilities;
    const abilityUUIDs = abilities.map( ability => ability.uuid ?? ability );
    this.parent.parent.parent.update( {
      [propertyKey]: {
        ...currentAbilities,
        [poolType]: currentAbilities[poolType].concat( abilityUUIDs )
      },
    } );
  }

  removeAbilities( abilities, poolType ) {
    const propertyKey = `system.advancement.levels.${this.level-1}.abilities.${poolType}`;
    const currentAbilities = this.abilities;
    const abilityUUIDs = abilities.map( ability => ability.uuid ?? ability );

    this.parent.parent.parent.update( {
      [propertyKey]: {
        ...currentAbilities,
        [poolType]: currentAbilities[poolType].filter( uuid => !abilityUUIDs.includes( uuid ) ) },
    } );
  }

  static initResourceStep( source ) {
    return source.level >= 13 ? 5 : 4;
  }
}