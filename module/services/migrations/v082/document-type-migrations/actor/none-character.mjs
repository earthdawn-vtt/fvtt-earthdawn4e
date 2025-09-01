import ED4E from "../../../../../config/_module.mjs";
import BaseMigration from "../../../common/base-migration.mjs";


export default class NoneCharacterMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {

    if ( source.system?.actorType ) source.type = source.system.actorType;

    if ( source.system ) {
      this.#migrateAttributes( source );
      if ( !source.system.characteristics ) {
        // Initialize characteristics once and work with a reference
        source.system.characteristics = {};
        const characteristics = source.system.characteristics;
      
        this.#migrateDefenses( source, characteristics );
        this.#migrateArmor( source, characteristics );
        this.#migrateHealth( source, characteristics );
        this.#migrateMovement( source, characteristics );
        this.#migrateRecoveryTests( source, characteristics );
        this.#migrateDamage( source, characteristics );
        this.#migrateWounds( source, characteristics );
      }
      if ( !source.system.knockdown?.step ) {
        this.#migrateKnockdown( source );
      }
      if ( !source.system.actions ) {
        this.#migrateActions( source );
      }
      if ( !source.system.initiative ) {
        this.#migrateInitiative( source );
      }
    }

    console.log( "Raw actor data after migration:", source.name, source.system.attributes );

    return source;
  }

  /**
   * Migrate attribute step values from old format to new format
   * @param {object} source - The source data object
   * @private
   */
  static #migrateAttributes( source ) {
    source.system.attributes ??= {};
    
    // Use the migration config for mapping
    const legacyAttributes = ED4E.systemV0_8_2.attributes;
    const currentAttributes = Object.keys( ED4E.attributes );

    for ( let i = 0; i < legacyAttributes.length && i < currentAttributes.length; i++ ) {
      const oldField = legacyAttributes[i];
      const newName = currentAttributes[i];
      
      source.system.attributes[newName] ??= {};
      
      const oldStepValue = source.system[oldField];
      if ( oldStepValue !== undefined && source.system.attributes[newName].step === undefined ) {
        source.system.attributes[newName].step = oldStepValue;
      }
    }
  }

  /**
   * Migrate characteristic data from old to new format
   * @param {object} source - The source data object
   * @param {string} characteristics - predefined characteristics path
   * @private
   */
  static #migrateDefenses( source, characteristics ) {
    characteristics.defenses ??= {};
    const defenses = characteristics.defenses;
    defenses.physical ??= {};
    defenses.physical.value = source.system.physicaldefense || 0;
    defenses.mystical ??= {};
    defenses.mystical.value = source.system.mysticdefense || 0;
    defenses.social ??= {};
    defenses.social.value = source.system.socialdefense || 0;
  }

  /**
   * Migrate characteristic data from old to new format
   * @param {object} source - The source data object
   * @param {string} characteristics - predefined characteristics path
   * @private
   */
  static #migrateArmor( source, characteristics ) {
    characteristics.armor ??= {};
    const armor = characteristics.armor;
    armor.physical ??= {};
    armor.physical.value = source.system.physicalarmor || 0;
    armor.mystical ??= {};
    armor.mystical.value = source.system.mysticarmor || 0;
  }

  /**
   * Migrate characteristic data from old to new format
   * @param {object} source - The source data object
   * @param {string} characteristics - predefined characteristics path
   * @private
   */
  static #migrateHealth( source, characteristics ) {
    const health = characteristics.health ??= {};
    health.death = source.system.deathThreshold || 0;
    health.unconscious = source.system.unconsciousThreshold || 0;
    health.woundThreshold = source.system.woundThreshold || 0;
  }

  /**
   * Migrate Actor Movement
   * @param {object} source - The source data object
   * @param {string} characteristics - predefined characteristics path
   * @private
   */
  static #migrateMovement( source, characteristics ) {
    characteristics.movement ??= {};
    characteristics.movement.walk = source.system.movement || 0;
  }

  /**
   * Migrate Actor Actions
   * @param {object} source - The source data object
   */
  static #migrateActions( source ) {
    //       "action": 1,
    source.system.actions = source.system.action || 1;
  }

  /**
   * Migrate Actor Knockdown
   * @param {object} source - The source data object
   */
  static #migrateKnockdown( source ) {
    const strengthStep = source.system?.attributes?.str.step || 1;
    source.system.knockdown = source.system.knockdown || strengthStep;
  }

  /**
   * Migrate Actor Recovery Tests
   * @param {object} source - The source data object
   * @param {string} characteristics - predefined characteristics path
   */
  static #migrateRecoveryTests( source, characteristics ) {
    // NOTE: The old system did not support an individual recovery step, 
    // NPCs used toughness and creatures did not have the option to recover at all
    const toughnessStep = source.system?.attributes?.tou.step || 1;
    const recoveryTestsResource = characteristics.recoveryTestsResource ??= {};
    recoveryTestsResource.value = source.system.recoverytestscurrent || 0;
    recoveryTestsResource.max = source.system.recoverytestsrefresh || 0;
    recoveryTestsResource.step = toughnessStep;
  }

  /**
   * Migrate Actor Damage
   * @param {object} source - The source data object
   * @param {string} characteristics - predefined characteristics path
   */
  static #migrateDamage( source, characteristics ) {
    characteristics.damage ??= {};
    const health = characteristics.damage.health ??= {};
    health.standard = source.system.damage || 0;
    health.stun = source.system.damageStun || 0;
  }

  /**
   * Migrate Actor Wounds
   * @param {object} source - The source data object
   * @param {string} characteristics - predefined characteristics path
   */
  static #migrateWounds( source, characteristics ) {
    characteristics.damage ??= {};
    characteristics.damage.health ??= {};
    characteristics.damage.health.wounds = source.system.wounds || 0;
  }

  /** 
   * Migrate Actor Initiative
   * @param {object} source - The source data object
   */
  static #migrateInitiative( source ) {
    //       "initiativeStep": 1,
    const dexterityStep = source.system?.attributes?.dex.step || 1;
    source.system.initiative = source.system.initiativeStep || dexterityStep;
  }

  
}