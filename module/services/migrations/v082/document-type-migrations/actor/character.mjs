import BaseMigration from "../../../common/base-migration.mjs";
import KnackSourceTalentMigration from "../../field-migrations/knack-source.mjs";
import NamegiverMigration from "../item/namegiver.mjs";
import { SYSTEM_TYPES } from "../../../../../constants/constants.mjs";

export default class CharacterMigration extends BaseMigration {
  
  static async migrateEarthdawnData( source ) {
    source.type = SYSTEM_TYPES.Actor.pc;

    const knackTypes = [
      SYSTEM_TYPES.Item.knackAbility,
      SYSTEM_TYPES.Item.knackKarma,
      SYSTEM_TYPES.Item.knackManeuver,
      SYSTEM_TYPES.Item.spellKnack,
    ];
    if ( source.items ) {
      for ( const item of source.items ) {
        if ( knackTypes.includes( item.type ) ) {
          KnackSourceTalentMigration.migrateEarthdawnData( source, item );
        }
        // Migrate namegiver items specifically
        if ( item.type === "namegiver" ) {
          NamegiverMigration.migrateEarthdawnData( item );
        }
      }
    }

    // Migrate character attributes
    this.#migrateAttributes( source );

    return source;
  }

  /**
   * Migrate attribute data from old to new format
   * @param {object} source - The source data object
   * @private
   */
  static #migrateAttributes( source ) {
    if ( !source.system?.attributes ) return;

    // Check if migration has already been performed by looking for new format
    const hasNewFormat = Object.keys( source.system.attributes ).some( key => 
      [ "dex", "str", "tou", "per", "wil", "cha" ].includes( key ) 
      && source.system.attributes[ key ]?.hasOwnProperty( "initialValue" )
    );

    if ( hasNewFormat ) {
      return;
    }

    // Attribute mapping from old names to new names
    const attributeMapping = {
      dex: { value: "dexterityvalue", promotions: "dexteritypromotions" },
      str: { value: "strengthvalue", promotions: "strengthpromotions" },
      tou: { value: "toughnessvalue", promotions: "toughnesspromotions" },
      per: { value: "perceptionvalue", promotions: "perceptionpromotions" },
      wil: { value: "willpowervalue", promotions: "willpowerpromotions" },
      cha: { value: "charismavalue", promotions: "charismapromotions" }
    };

    // Migrate each attribute
    for ( const [ newName, oldFields ] of Object.entries( attributeMapping ) ) {
      const oldValue = source.system.attributes[oldFields.value];
      const oldPromotions = source.system.attributes[oldFields.promotions];

      // Only migrate if we have old data and the new format doesn't already exist
      if ( oldValue !== undefined && !source.system.attributes[newName]?.hasOwnProperty( "initialValue" ) ) {
        source.system.attributes[newName] ??= {};
        if ( typeof oldValue === "object" && oldValue.hasOwnProperty( "initialValue" ) ) {
          source.system.attributes[newName].initialValue = oldValue.initialValue;
        } else {
          source.system.attributes[newName].initialValue = oldValue;
        }
        if ( typeof oldPromotions === "object" && oldPromotions.hasOwnProperty( "timesIncreased" ) ) {
          source.system.attributes[newName].timesIncreased = oldPromotions.timesIncreased;
        } else {
          source.system.attributes[newName].timesIncreased = oldPromotions ?? 0;
        }
      }
    }
  }
}