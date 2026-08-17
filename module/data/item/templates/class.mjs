import AdvancementData from "../../advancement/base-advancement.mjs";
import LpIncreaseTemplate from "./lp-increase.mjs";
import LearnableTemplate from "./learnable.mjs";
import ClassAdvancementDialog from "../../../applications/advancement/class-advancement.mjs";
import ItemDataModel from "../../abstract/item-data-model.mjs";
import { SYSTEM_TYPES } from "../../../constants/constants.mjs";
import * as LEGEND from "../../../config/legend.mjs";


/**
 * @import { ClassTemplateData } from "./_types.mjs";
 */

/**
 * Data model template with information on "class"-like items: paths, disciplines, and questors.
 * @augments {ItemDataModel<ClassTemplateData>}
 * @mixes LearnableTemplate
 * @mixes LpIncreaseTemplate
 * @see {@link ClassTemplateData} The system data model for this template.
 */
export default class ClassTemplate extends ItemDataModel.mixin(
  LearnableTemplate,
  LpIncreaseTemplate
) {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      level: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      advancement: new fields.EmbeddedDataField(
        AdvancementData,
        {
          required: true,
        }
      )
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Class",
  ];

  // endregion

  // region Getters

  /**
   * The tier of the current level. Returns an empty string if no level is found.
   * @type {string}
   */
  get currentTier() {
    return this._getAdvancementLevelData( this.unmodifiedLevel )?.tier ?? "";
  }

  /** @inheritDoc */
  get canBeLearned() {
    return true;
  }

  /** @inheritDoc */
  get increasable() {
    return true;
  }

  /** @inheritDoc */
  get learnable() {
    return true;
  }

  /** @inheritDoc */
  get requiredLpForIncrease() {
    if ( this.parent.type !== SYSTEM_TYPES.Item.discipline ) return 0;
    const nextLevel = this.unmodifiedLevel + 1;
    const disciplineSortingFactor = this.order - 1;
    const nextLevelTier = nextLevel === 0 ? "novice" : this._getAdvancementLevelData( nextLevel )?.tier;
    return LEGEND.legendPointsCost[
      1 // new level
    + disciplineSortingFactor
    + LEGEND.lpIndexModForTier[1][nextLevelTier]
    ];
  }

  /** @inheritDoc */
  get requiredLpToLearn() {
    return 0;
  }

  // endregion

  // region Rolling

  /** @inheritDoc */
  getRollData() {
    return {
      level:  this.level,
      circle: this.level,
    };
  }

  // endregion

  // region LP Tracking

  /**
   * Get all ability UUIDs referenced in this class's advancement data.
   * @returns {string[]} A flat array of all ability UUIDs referenced in this class's advancement data.
   */
  getAllAbilityUuids() {
    const levels = this._getAdvancementLevels();
    return levels
      .flatMap( level => Array.from( level.abilities.class ) )
      .concat( levels.flatMap( level => Array.from( level.abilities.free ) ) )
      .concat( levels.flatMap( level => Array.from( level.abilities.special ) ) )
      .concat( Object.values( this.advancement.abilityOptions ).flatMap( pool => Array.from( pool ) ) );
  }

  /**
   * Get advancement levels as an array, regardless of whether levels are stored as an array or keyed object.
   * @returns {object[]} The available advancement level data entries.
   */
  _getAdvancementLevels() {
    return Object.values( this.advancement?.levels ?? {} );
  }

  /**
   * Get one advancement level by its numeric level value, based on {@link AdvancementLevels}.
   * @param {number} level The level number to look up.
   * @returns {AdvancementLevelData|undefined} The matching advancement level data, if present.
   */
  _getAdvancementLevelData( level ) {
    const levels = this.advancement?.levels ?? {};
    return levels[level];
  }

  /**
   * Get the casting type of the class, if it has a thread weaving ability for spellcasting.
   * @returns {Promise<typeof AbilityTemplate.castingType>} The casting type of the class, see {@link AbilityTemplate.castingType}.
   */
  async getCastingType() {
    const allUuids = this.getAllAbilityUuids();
    const abilities = await Promise.all( allUuids.map( uuid => fromUuid( uuid ) ) );
    
    // Find abilities with rollType === "threadWeaving"
    const threadWeavingAbility = abilities.find( ability => 
      ability?.system?.rollType === "threadWeaving"
    );
    
    // Return the castingType from the thread weaving ability (uses getter)
    return threadWeavingAbility?.system?.castingType;
  }

  // region LP Increase

  /** @inheritDoc */
   
  /** @inheritdoc */
  async increase() {
    if ( !this.isActorEmbedded ) return;

    const nextLevel = this.unmodifiedLevel + 1;
    const nextLevelData = this._getAdvancementLevelData( nextLevel );
    if ( !nextLevelData ) {
      ui.notifications.warn( "ED.Notifications.Warn.noMoreClassLevelsToIncrease" );
      return;
    }
    const nextTier = nextLevelData.tier;

    const { proceed, abilityChoice, spells} = await ClassAdvancementDialog.waitPrompt( this.parent );
    if ( !proceed ) return;

    let updatedClass;
    if ( nextLevel !== 1 ) updatedClass = await this.parentDocument.update( { "system.level": nextLevel } );

    const systemSourceData = {
      system: {
        tier:   nextTier,
        source: {
          class:   this.parent.uuid,
          atLevel: nextLevel,
        },
        talentCategory: "discipline",
      },
    };

    await this._learnAbilityChoice( abilityChoice, systemSourceData, nextLevel, nextTier );
    await this._learnSpells( spells, systemSourceData );
    await this._learnAbilities( nextLevelData, systemSourceData );

    await this._addFreeAbilities( nextLevelData, systemSourceData );
    await this._addPermanentEffects( nextLevelData );

    await this._increaseResourceStep( nextLevelData );
    await this._increaseFreeAbilities( nextLevel );

    if ( nextLevel === 1 && !updatedClass ) updatedClass = await this.parentDocument.update( { "system.level": nextLevel } );

    if ( updatedClass?.system.level !== nextLevel ) {
      ui.notifications.warn( "ED.Notifications.Warn.classIncreaseProblems" );
    }

    return updatedClass;
  }

  /**
   * Increase the level of free abilities to the new circle. Only updates those abilities that are lower than the
   * next level.
   * @param {number} nextLevel  The new circle/level.
   * @protected
   */
  async _increaseFreeAbilities( nextLevel ) {
    // increase all abilities of category "free" to the new circle, if lower
    const freeAbilities = this.containingActor.items.filter(
      i => i.system.talentCategory === "free"
        && i.system.source?.class === this.parent.id
        && i.system.level < nextLevel
    );

    for ( const ability of freeAbilities ) {
      await ability.update( { "system.level": nextLevel } );
    }
  }

  /**
   * Increase the resource step (karma or devotion) based on the new level.
   * @param {AdvancementLevelData} nextLevelData  The data for the new level.
   * @protected
   */
  async _increaseResourceStep( nextLevelData ) {
    const highestDiscipline = this.containingActor.highestDiscipline;

    const resourceStep = nextLevelData.resourceStep;
    if ( this.parent.type === SYSTEM_TYPES.Item.discipline && this.parent.id === highestDiscipline.id ) {
      await this.containingActor.update( { "system.karma.step": resourceStep } );
    } else if ( this.parent.type === SYSTEM_TYPES.Item.questor ) {
      await this.containingActor.update( { "system.devotion.step": resourceStep } );
    }
  }

  /**
   * Add permanent effects from the new level.
   * @param {AdvancementLevelData} nextLevelData  The data for the new level.
   * @protected
   */
  async _addPermanentEffects( nextLevelData ) {
    const newEffects = await Promise.all(
      Array.from( nextLevelData.effects ).map(
        async uuid => fromUuid( uuid ),
      )
    );

    await this._replacePreviousClassEffects( newEffects );
    await this.containingActor.updateClassEffectStates();
  }

  /**
   * Remove class effects from previous levels of this class that are replaced by effects
   * from the new level. This only replaces old effects that apply changes to the same change key
   * as an effect from the new level.
   * @param {EarthdawnActiveEffect[]} newEffects An array of new effects to add.
   */
  async _replacePreviousClassEffects( newEffects ) {
    const newChangeKeys = newEffects.map( effect => {
      this._validateSingleChange( effect, "new" );
      return effect.system.changes[0].key;
    } );

    if ( newChangeKeys.length === 0 ) return;

    const effectsToRemove = this.containingActor.classEffects.filter( effect => {
      if ( effect.origin !== this.parent.uuid ) return false;
      this._validateSingleChange( effect, "existing" );
      return newChangeKeys.includes( effect.system.changes[0].key );
    } );

    await this.containingActor.deleteEmbeddedDocuments(
      "ActiveEffect",
      effectsToRemove.map( e => e.id )
    );
    const permanentNewEffects = await this._getEffectsForPermanentUse( newEffects, true );
    await this.containingActor.createEmbeddedDocuments(
      "ActiveEffect",
      permanentNewEffects
    );
  }

  /**
   * Validate that the effect has only one change.
   * @param {EarthdawnActiveEffect} effect The effect to validate.
   * @param {string} type A string indicating whether the effect is "new" or
   * "existing" for error messages.
   * @throws {Error} If the effect has more than one change or no changes at all.
   * @protected
   */
  _validateSingleChange( effect, type ) {
    if ( effect.system.changes.length !== 1 ) {
      throw new Error( `ClassTemplate._addPermanentEffects: ${type} class effect has more than one change` );
    }
  }

  /**
   * Get effects updated to be permanent, enabled, and not transferred to the target.
   * @param {EarthdawnActiveEffect[]} effects The effects to update.
   * @param {boolean} [disabled] Whether the effects should be disabled.
   * @returns {Promise<object[]>} The updated effects data.
   */
  async _getEffectsForPermanentUse( effects, disabled = false ) {
    const permanentSettings = {
      disabled: disabled,
      transfer: true,
      origin:   this.parent.uuid,
      system:   {
        duration:         { valueFormula: null, },
        transferring:     { target: "owner", },
      },
    };

    const updatedEffects = [];
    for ( const effect of effects ) {
      updatedEffects.push(
        foundry.utils.mergeObject(
          effect.toObject(),
          permanentSettings,
          { inplace: false }
        )
      );
    }

    return updatedEffects;
  }

  /**
   * Add free and special abilities from the new level.
   * @param {AdvancementLevelData} nextLevelData  The data for the new level.
   * @param {object} systemSourceData             The system source data to apply to the new abilities.
   * @protected
   */
  async _addFreeAbilities( nextLevelData, systemSourceData ) {
    const mergeObject = foundry.utils.mergeObject;

    const freeAbilityData = await Promise.all(
      nextLevelData.abilities.free.map(
        async uuid => {
          const item = await fromUuid( uuid );
          return mergeObject(
            item?.toObject(),
            mergeObject(
              systemSourceData,
              { system: { talentCategory: "free"} },
              { inplace: false }
            ),
            { inplace: false },
          );
        }
      ) );

    const specialAbilityData = await Promise.all(
      nextLevelData.abilities.special.map( ability => fromUuid( ability ) )
    );

    await this.containingActor.createEmbeddedDocuments( "Item", [ ...freeAbilityData, ...specialAbilityData ] );
  }

  /**
   * Learn the discipline/class abilities from the new level.
   * @param {AdvancementLevelData} nextLevelData  The data for the new level.
   * @param {object} systemSourceData             The system source data to apply.
   * @protected
   */
  async _learnAbilities( nextLevelData, systemSourceData ) {
    for ( const abilityUuid of nextLevelData.abilities.class ) {
      const ability = /** @type { ItemEd } */ await fromUuid( abilityUuid );
      await ability?.system?.constructor?.learn(
        this.containingActor,
        ability,
        systemSourceData
      );
    }
  }

  /**
   * Learn the selected spells.
   * @param {string[]} spells          The UUIDs of the spells to learn.
   * @param {object} systemSourceData  The system source data to apply.
   * @protected
   */
  async _learnSpells( spells, systemSourceData ) {
    for ( const spellUuid of spells ) {
      const spell = await fromUuid( spellUuid );
      await spell?.system?.constructor?.learn(
        this.containingActor,
        spell,
        systemSourceData
      );
    }
  }

  /**
   * Learn the selected optional ability.
   * @param {string} abilityChoice     The UUID of the selected ability.
   * @param {object} systemSourceData  The system source data to apply.
   * @param {number} nextLevel         The level at which the ability is learned.
   * @param {string} nextTier          The tier of the ability.
   * @protected
   */
  async _learnAbilityChoice( abilityChoice, systemSourceData, nextLevel, nextTier ) {
    const abilityChoiceItem = /** @type { ItemEd } */ await fromUuid( abilityChoice );
    await abilityChoiceItem?.system?.constructor?.learn(
      this.containingActor,
      abilityChoiceItem,
      foundry.utils.mergeObject(
        systemSourceData,
        {
          "system.source.class":   this.parentDocument.id,
          "system.source.atLevel": nextLevel,
          "system.talentCategory": "optional",
          "system.tier":           nextTier
        },
        { inplace: false }
      )
    );
  }

  // endregion

  // endregion

}