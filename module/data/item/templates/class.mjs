import AdvancementData from "../../advancement/base-advancement.mjs";
import LpIncreaseTemplate from "./lp-increase.mjs";
import LearnableTemplate from "./learnable.mjs";
import ClassAdvancementDialog from "../../../applications/advancement/class-advancement.mjs";
import ED4E from "../../../config/_module.mjs";
import ItemDataModel from "../../abstract/item-data-model.mjs";
import { SYSTEM_TYPES } from "../../../constants/constants.mjs";

/**
 * Data model template with information on "class"-like items: paths, disciplines, and questors.
 * @property {number} level         either circle or rank of the class 
 * @property {string} identifier    type of class
 * @augments {ItemDataModel}
 * @augments {LearnableTemplate}
 * @augments {LpIncreaseTemplate}
 * @mixes LearnableTemplate
 * @mixes LpIncreaseTemplate
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
    return this.advancement?.levels[this.unmodifiedLevel - 1]?.tier ?? "";
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
    const nextLevelTier = nextLevel === 0 ? "novice" : this.advancement.levels.find( l => l.level === nextLevel )?.tier;
    return ED4E.legendPointsCost[
      1 // new level
    + disciplineSortingFactor
    + ED4E.lpIndexModForTier[1][nextLevelTier]
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
    return this.advancement.levels
      .flatMap( level => Array.from( level.abilities.class ) )
      .concat( this.advancement.levels.flatMap( level => Array.from( level.abilities.free ) ) )
      .concat( this.advancement.levels.flatMap( level => Array.from( level.abilities.special ) ) )
      .concat( Object.values( this.advancement.abilityOptions ).flatMap( pool => Array.from( pool ) ) );
  }

  /**
   * Get the casting type of the class, if it has a thread weaving ability for spellcasting.
   * @returns {typeof AbilityTemplate.castingType} The casting type of the class, see {@link AbilityTemplate.castingType}.
   */
  getCastingType() {
    const allUuids = this.getAllAbilityUuids();
    const abilities = allUuids.map( uuid => fromUuidSync( uuid ) );
    
    // Find abilities with rollType === "threadWeaving"
    const threadWeavingAbility = abilities.find( ability => 
      ability?.system?.rollType === "threadWeaving"
    );
    
    // Return the castingType from the thread weaving ability (uses getter)
    return threadWeavingAbility?.system?.castingType;
  }

  // region LP Increase

  /** @inheritDoc */
   
  async increase() {
    if ( !this.isActorEmbedded ) return;

    const nextLevel = this.unmodifiedLevel + 1;
    const nextLevelData = this.advancement.levels.find( l => l.level === nextLevel );
    if ( !nextLevelData ) {
      ui.notifications.warn( "ED.Notifications.Warn.noMoreClassLevelsToIncrease" );
      return;
    }
    const nextTier = nextLevelData.tier;

    const { proceed, abilityChoice, spells} = await ClassAdvancementDialog.waitPrompt( this.parent );
    if ( !proceed ) return;

    // update the class first
    const updatedClass = await this.parentDocument.update( { "system.level": nextLevel } );
    if ( updatedClass.system.level !== nextLevel ) {
      ui.notifications.warn( "ED.Notifications.Warn.classIncreaseProblems" );
    }

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

    // we only land here if the class increase was successful
    return updatedClass;
  }

  async _increaseFreeAbilities( nextLevel ) {
    // increase all abilities of category "free" to new circle, if lower
    const freeAbilities = this.containingActor.items.filter(
      i => i.system.talentCategory === "free"
        && i.system.source?.class === this.parent.uuid
        && i.system.level < nextLevel
    );
    // TODO: check if there are any free abilities already on this level or higher
    // if so, add new earnings lp transaction to refund the spent lp to raise
    // the free talent

    for ( const ability of freeAbilities ) {
      await ability.update( { "system.level": nextLevel } );
    }
  }

  async _increaseResourceStep( nextLevelData ) {
    const highestDiscipline = this.containingActor.highestDiscipline;

    const resourceStep = nextLevelData.resourceStep;
    if ( this.parent.type === SYSTEM_TYPES.Item.discipline && this.parent.id === highestDiscipline.id ) {
      await this.containingActor.update( { "system.karma.step": resourceStep } );
    } else if ( this.parent.type === SYSTEM_TYPES.Item.questor ) {
      await this.containingActor.update( { "system.devotion.step": resourceStep } );
    }
  }

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
   * @returns {Promise<void>}
   */
  async _replacePreviousClassEffects( newEffects ) {
    const newChangeKeys = newEffects.map( effect => {
      this._validateSingleChange( effect, "new" );
      return effect.changes[0].key;
    } );

    if ( newChangeKeys.length === 0 ) return;

    const effectsToRemove = this.containingActor.classEffects.filter( effect => {
      if ( effect.system.source?.documentOriginUuid !== this.parent.uuid ) return false;
      this._validateSingleChange( effect, "existing" );
      return newChangeKeys.includes( effect.changes[0].key );
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
    if ( effect.changes.length !== 1 ) {
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
      system:   {
        duration:         { type: "permanent" },
        transferToTarget: false,
        source:           {
          documentOriginUuid: this.parent.uuid,
          documentOriginType: this.parent.type,
        },
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

  async _addFreeAbilities( nextLevelData, systemSourceData ) {
    const freeAbilityData = await Promise.all(
      nextLevelData.abilities.free.map(
        async uuid => {
          const item = await fromUuid( uuid );
          return Object.assign(
            item?.toObject(),
            systemSourceData
          );
        }
      ) );

    const specialAbilityData = await Promise.all(
      nextLevelData.abilities.special.map( ability => fromUuid( ability ) )
    );

    await this.containingActor.createEmbeddedDocuments( "Item", [ ...freeAbilityData, ...specialAbilityData ] );
  }

  async _learnAbilities( nextLevelData, systemSourceData ) {
    for ( const abilityUuid of nextLevelData.abilities.class ) {
      const ability = await fromUuid( abilityUuid );
      await ability?.system?.constructor?.learn(
        this.containingActor,
        ability,
        systemSourceData
      );
    }
  }

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

  async _learnAbilityChoice( abilityChoice, systemSourceData, nextLevel, nextTier ) {
    const abilityChoiceItem = await fromUuid( abilityChoice );
    const learnedAbilityChoice = await abilityChoiceItem?.system?.constructor?.learn(
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
    await learnedAbilityChoice?.system?.increase();
  }

  // endregion

  // endregion

  // region Migration

  /** @inheritDoc */
  static migrateData( source ) {
    super.migrateData( source );
    // specific migration functions
  }

  // endregion

}