import AbilityTemplate from "../item/templates/ability.mjs";
import AdvancementLevelData from "./advancement-level.mjs";
import SparseDataModel from "../abstract/sparse-data-model.mjs";
import { mapObject } from "../../utils.mjs";

/**
 * @typedef {Record<number, AdvancementLevelData>} AdvancementLevels
 * Keys are the level number of the corresponding level data.
 */

/**
 * Advancement of Disciplines, Paths and Questors
 */

export default class AdvancementData extends SparseDataModel {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      levels: new fields.TypedObjectField(
        new fields.EmbeddedDataField(
          AdvancementLevelData,
          {
            required: false,
            nullable: true,
          }
        ),
        {
          required: true,
          nullable: true,
          initial:  {},
        } ),
      abilityOptions: new fields.TypedObjectField(
        new fields.SetField(
          new fields.DocumentUUIDField(
            AbilityTemplate ),
          {
            required: true,
            empty:    true,
          } ),
        {
          initial:  mapObject( CONFIG.ED4E.tier, ( key, _ ) => [ key, [] ] ),
          required: true,
          nullable: false,
        } ),
      learnedOptions: new fields.TypedObjectField(
        new fields.NumberField( {
          required: true,
          nullable: false,
          positive:  true,
          integer:   true,
        } ),
        {
          required:        true,
          nullable:        false,
        } ),
    };
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.Advancement",
  ];

  // endregion

  // region Getters

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
   * The number of levels in this advancement.
   * @type {number}
   */
  get numLevels() {
    return Object.keys( this.levels ).length ?? 0;
  }

  // endregion

  // region Methods

  /**
   * Add abilities to the given type of options pool.
   * @param {[ItemEd|string]} abilities         An array of ability item or their UUIDs to add.
   * @param {keyof typeof ED4E.tier} poolType   The type/tier of pool the abilities are added to.
   */
  addAbilities( abilities, poolType ) {
    const propertyKey = `system.advancement.abilityOptions.${poolType}`;
    const currentAbilities = this.abilityOptions[poolType];
    const abilityIDs = abilities.map( ability => ability.uuid ?? ability );
    this.parentDocument.update( {
      [propertyKey]: currentAbilities.concat( abilityIDs ),
    } );
  }

  /**
   * Add a new level to this advancement.
   * @param {object} [data]    If provided, will initialize the new level with the given data.
   */
  async addLevel( data = {} ) {
    const newLevel = data.level ?? this.numLevels + 1;
    await this.parentDocument.update( {
      [ `system.advancement.levels.${ newLevel }` ]: new AdvancementLevelData( {
        ...data,
        level: newLevel,
      } ),
    } );
  }

  /**
   * Remove the last {@link amount} levels added from this advancement.
   * @param {number} [amount]   The number of levels to remove.
   */
  async deleteLevel( amount = 1 ) {
    const newMaxLevel = this.numLevels - amount;
    const updates = {};

    for ( let level = this.numLevels; level > newMaxLevel; level-- ) {
      updates[ `system.advancement.levels.-=${ level }` ] = null;
    }

    await this.parentDocument.update( updates );
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

    this.parentDocument.update( {
      [propertyKey]: currentAbilities.filter( uuid => !abilityUUIDs.includes( uuid ) ),
    } );
  }

  // endregion

  // region Migration

  static migrateData( source ) {
    if ( Array.isArray( source.levels ) ) {
      source.levels = source.levels.reduce( ( acc, levelData ) => {
        acc[levelData.level] = levelData;
        return acc;
      }, {} );
    }
    return super.migrateData( source );
  }

  // endregion
}