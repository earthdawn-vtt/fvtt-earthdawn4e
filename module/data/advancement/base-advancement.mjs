import { SparseDataModel } from "../abstract.mjs";
import AbilityTemplate from "../item/templates/ability.mjs";
import AdvancementLevelData from "./advancement-level.mjs";
import MappingField from "../fields/mapping-field.mjs";

/**
 * Advancement of Disciplines, Paths and Questors
 */

export default class AdvancementData extends SparseDataModel {

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      levels: new fields.ArrayField(
        new fields.EmbeddedDataField(
          AdvancementLevelData,
          {
            required: false,
            nullable: true,
            label:    "ED.advancementLevel",
            hint:     "ED.aLevelInThisAdvancement"
          }
        ),
        {
          required: true,
          nullable: true,
          initial:  [],
        } ),
      abilityOptions: new MappingField(
        new fields.SetField(
          new fields.DocumentUUIDField(
            AbilityTemplate,
            {
              label: this.labelKey( "classAbilityOption" ),
              hint:  this.hintKey( "classAbilityOption" ),
            }
          ),
          {
            required: true,
            empty:    true,
            label:    this.labelKey( "classAbilityOptionsPools" ),
            hint:     this.hintKey( "classAbilityOptionsPools" ),
          } ),
        {
          initialKeys:     CONFIG.ED4E.tier,
          initialKeysOnly: true,
          required:        true,
          nullable:        false,
          label:           this.labelKey( "classAbilityOptionsByTier" ),
          hint:            this.hintKey( "classAbilityOptionsByTier" ),
        } ),
      learnedOptions: new MappingField(
        new fields.NumberField( {
          required: true,
          nullable: false,
          positive:  true,
          integer:   true,
          label:    this.labelKey( "classLearnedOption" ),
          hint:     this.hintKey( "classLearnedOption" ),
        } ),
        {
          initialKeysOnly: false,
          required:        true,
          nullable:        false,
          empty:           true,
          label:           this.labelKey( "classLearnedOptions" ),
          hint:            this.hintKey( "classLearnedOptions" ),
        } ),
    };
  }

  /* -------------------------------------------- */

  /**
   * Get the abilities that are not yet learned for each tier.
   * @type {Record<string,Set<string>>}
   */
  get availableAbilityOptions() {
    const learnedOptions = Object.keys( this.learnedOptions );
    return Object.fromEntries(
      Object.entries( this.abilityOptions ).map(
        ( [ tier, options ] ) => [ tier, options.filter( uuid => !learnedOptions.includes( uuid ) ) ]
      )
    );
  }

  /**
   * Add abilities to the given type of options pool.
   * @param {[ItemEd|string]} abilities         An array of ability item or their UUIDs to add.
   * @param {keyof typeof ED4E.tier} poolType   The type/tier of pool the abilities are added to.
   */
  addAbilities( abilities, poolType ) {
    const propertyKey = `system.advancement.abilityOptions.${poolType}`;
    const currentAbilities = this.abilityOptions[poolType];
    const abilityIDs = abilities.map( ability => ability.uuid ?? ability );
    this.parent.parent.update( {
      [propertyKey]: currentAbilities.concat( abilityIDs ),
    } );
  }

  /**
   * Add a new level to this advancement.
   * @param {object} [data]    If provided, will initialize the new level with the given data.
   */
  addLevel( data = {} ) {
    this.parent.parent.update( {
      "system.advancement.levels": this.levels.concat(
        new AdvancementLevelData(
          {
            ...data,
            level: this.levels.length + 1
          }
        )
      )
    } );
  }

  /**
   * Remove the last {@link amount} levels added from this advancement.
   * @param {number} [amount]   The number of levels to remove.
   */
  deleteLevel( amount = 1 ) {
    this.parent.parent.update( {
      "system.advancement.levels": this.levels.slice( 0, -( amount ?? 1 ) )
    } );
  }

  /**
   * Get the level at which the given ability was learned.
   * @param {ItemEd|string} ability   The ability item or its UUID.
   * @returns {number|undefined}      The level at which the ability was learned, or undefined if it was not learned.
   */
  learnedAtLevel( ability ) {
    const uuid = ability.uuid ?? ability;
    return this.learnedOptions[uuid];
  }

  /**
   * Remove abilities from the given type of pool.
   * @param {[ItemEd|string]} abilities             An array of ability items or their UUIDs to remove.
   * @param {keyof typeof ED4E.tier} poolType       The type/tier of pool the abilities are removed from.
   */
  removeAbilities( abilities, poolType ) {
    const propertyKey = `system.advancement.abilityOptions.${poolType}`;
    const currentAbilities = this.abilityOptions[poolType];
    const abilityUUIDs = abilities.map( ability => ability.uuid ?? ability );

    this.parent.parent.update( {
      [propertyKey]: currentAbilities.filter( uuid => !abilityUUIDs.includes( uuid ) ),
    } );
  }
}