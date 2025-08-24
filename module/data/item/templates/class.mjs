import AdvancementData from "../../advancement/base-advancement.mjs";
import LpIncreaseTemplate from "./lp-increase.mjs";
import LearnableTemplate from "./learnable.mjs";
import ClassAdvancementDialog from "../../../applications/advancement/class-advancement.mjs";
import ED4E from "../../../config/_module.mjs";
import ItemDataModel from "../../abstract/item-data-model.mjs";

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

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Class",
  ];

  // endregion

  // region Static Methods

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

  // region Properties

  /**
   * The tier of the current level. Returns an empty string if no level is found.
   * @type {string}
   */
  get currentTier() {
    return this.advancement?.levels[this.level - 1]?.tier ?? "";
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
    if ( this.parent.type !== "discipline" ) return 0;
    const nextLevel = this.level + 1;
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

    const nextLevel = this.level + 1;
    const nextLevelData = this.advancement.levels.find( l => l.level === nextLevel );
    if ( !nextLevelData ) {
      ui.notifications.warn( "ED.Notifications.Warn.noMoreClassLevelsToIncrease" );
      return;
    }
    const nextTier = nextLevelData.tier;

    const { proceed, abilityChoice, spells} = await ClassAdvancementDialog.waitPrompt( this.parent );
    if ( !proceed ) return;

    // update the class first
    const updatedClass = await this.parent.update( { "system.level": nextLevel } );
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
    return this.parent;
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
    if ( this.parent.type === "discipline" && this.parent.id === highestDiscipline.id ) {
      await this.containingActor.update( { "system.karma.step": resourceStep } );
    } else if ( this.parent.type === "questor" ) {
      await this.containingActor.update( { "system.devotion.step": resourceStep } );
    }
  }

  async _addPermanentEffects( nextLevelData ) {
    const newEffects = /** @type {EarthdawnActiveEffect[]} */ Array.from( nextLevelData.effects );

    const mappedExisting = this.containingActor.classEffects.reduce(
      ( mappedEffects, effect ) => {
        if ( effect.changes.length !== 1 ) {
          throw new Error( "ClassTemplate._addPermanentEffects: existing class effect has more than one change" );
        }
        const currentKey = effect.changes[0].key;
        const currentValue = effect.changes[0].value;

        if ( mappedEffects[currentKey] ) {
          mappedEffects[currentKey].effects.push( effect );
          mappedEffects[currentKey].value += currentValue;
        } else {
          mappedEffects[currentKey] = {
            effects: [ effect ],
            value:   currentValue,
          };
        }

        return mappedEffects;
      },
      {}
    ) ;

    const effectsToAdd = [];
    const effectsToRemove = [];

    newEffects.forEach( newEffect => {
      if ( newEffect.changes.length !== 1 ) {
        throw new Error( "ClassTemplate._addPermanentEffects: new class effect has more than one change" );
      }
      const newKey = newEffect.changes[0].key;
      const newValue = newEffect.changes[0].value;

      if ( mappedExisting[newKey] ) {
        if ( mappedExisting[newKey].value < newValue ) {
          effectsToRemove.push( ...mappedExisting[newKey].effects );
          effectsToAdd.push( newEffect );
        }
      } else {
        effectsToAdd.push( newEffect );
      }
    } );

    for ( const effect of effectsToAdd ) {
      await effect.update( {
        disabled: false,
        system:   {
          duration: {
            type: "permanent",
          },
          transferToTarget: false,
          source:           {
            documentOriginUuid: this.parent.uuid,
            documentOriginType: this.parent.type,
          },
        },
      } );
    }

    await this.containingActor.createEmbeddedDocuments( "ActiveEffect", effectsToAdd );
    await this.containingActor.deleteEmbeddedDocuments( "ActiveEffect", effectsToRemove.map( e => e.id ) );
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
          "system.source.class":   this.parent.uuid,
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