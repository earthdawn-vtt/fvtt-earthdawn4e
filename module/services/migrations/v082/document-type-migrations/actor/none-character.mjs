import ED4E from "../../../../../config/_module.mjs";
import BaseMigration from "../../../common/base-migration.mjs";


export default class NoneCharacterMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {

    if ( source.system?.actorType ) source.type = source.system.actorType;

    if ( source.system ) {
      this.#migrateAttributes( source );
      if ( !source.system.characteristics ) {
        this.#migrateDefenses( source );
        this.#migrateArmor( source );
        this.#migrateHealth( source );
        this.#migrateMovement( source );
        this.#migrateRecoveryTests( source );
        this.#migrateDamage( source );
        this.#migrateWounds( source );
      }
      if ( !source.system.knockdown.step ) {
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
   * @private
   */
  static #migrateDefenses( source ) {
    source.system.characteristics ??= {};
    source.system.characteristics.defenses ??= {};
    source.system.characteristics.defenses.physical ??= {};
    source.system.characteristics.defenses.physical.value = source.system.physicaldefense || 0;
    source.system.characteristics.defenses.mystical ??= {};
    source.system.characteristics.defenses.mystical.value = source.system.mysticdefense || 0;
    source.system.characteristics.defenses.social ??= {};
    source.system.characteristics.defenses.social.value = source.system.socialdefense || 0;
  }

  /**
   * Migrate characteristic data from old to new format
   * @param {object} source - The source data object
   * @private
   */
  static #migrateArmor( source ) {
    source.system.characteristics ??= {};
    source.system.characteristics.armor ??= {};
    source.system.characteristics.armor.physical ??= {};
    source.system.characteristics.armor.physical.value = source.system.physicalarmor || 0;
    source.system.characteristics.armor.mystical ??= {};
    source.system.characteristics.armor.mystical.value = source.system.mysticarmor || 0;
  }

  /**
   * Migrate characteristic data from old to new format
   * @param {object} source - The source data object
   * @private
   */
  static #migrateHealth( source ) {
    source.system.characteristics ??= {};
    source.system.characteristics.health ??= {};
    source.system.characteristics.health.death = source.system.deathThreshold || 0;
    source.system.characteristics.health.unconscious = source.system.unconsciousThreshold || 0;
    source.system.characteristics.health.woundThreshold = source.system.woundThreshold || 0;
  }

  /**
   * Migrate Actor Movement
   * @param {object} source - The source data object
   */
  static #migrateMovement( source ) {
    source.system.characteristics ??= {};
    source.system.characteristics.movement ??= {};
    source.system.characteristics.movement.walk = source.system.movement || 0;
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
   */
  static #migrateRecoveryTests( source ) {
    // NOTE: The old system did not support an individual recovery step, 
    // NPCs used toughness and creatures did not have the option to recover at all
    const toughnessStep = source.system?.attributes?.tou.step || 1;
    source.system.characteristics ??= {};
    source.system.characteristics.recoveryTestsResource ??= {};
    source.system.characteristics.recoveryTestsResource.value = source.system.recoverytestscurrent || 0;
    source.system.characteristics.recoveryTestsResource.max = source.system.recoverytestsrefresh || 0;
    source.system.characteristics.recoveryTestsResource.step = toughnessStep;
  }

  /**
   * Migrate Actor Damage
   * @param {object} source - The source data object
   */
  static #migrateDamage( source ) {
    source.system.characteristics ??= {};
    source.system.characteristics.damage ??= {};
    source.system.characteristics.damage.health ??= {};
    source.system.characteristics.damage.health.standard = source.system.damage || 0;
    source.system.characteristics.damage.health.stun = source.system.damageStun || 0;
  }

  /**
   * Migrate Actor Wounds
   * @param {object} source - The source data object
   */
  static #migrateWounds( source ) {
    source.system.characteristics ??= {};
    source.system.characteristics.damage ??= {};
    source.system.characteristics.damage.health ??= {};
    source.system.characteristics.damage.health.wounds = source.system.wounds || 0;
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