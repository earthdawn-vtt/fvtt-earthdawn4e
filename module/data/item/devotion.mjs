import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ED4E from "../../config/_module.mjs";
import { createContentLink } from "../../utils.mjs";
import IncreasableAbilityTemplate from "./templates/increasable-ability.mjs";
const { DialogV2 } = foundry.applications.api;

/**
 * Data model template with information on Devotion items.
 */
export default class DevotionData extends IncreasableAbilityTemplate.mixin(
  ItemDescriptionTemplate
)  {

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      devotionRequired: new fields.BooleanField( {
        required: true,
        initial:  false,
        label:    this.labelKey( "Ability.devotionRequired" ),
        hint:     this.hintKey( "Ability.devotionRequired" )
      } ),
      durability: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "Ability.durability" ),
        hint:     this.hintKey( "Ability.durability" )
      } ),
    } );
  }

  /**
   * @inheritDoc
   */
  get canBeIncreased() {
    return this.isActorEmbedded
      && Object.values(
        this.increaseValidationData
      ).every( Boolean );
  }

  /**
   * @inheritDoc
   */
  get canBeLearned() {
    return true;
    // return [ "pc", "npc" ].includes( this.parent.actor?.type );
  }

  /**
   * @inheritDoc
   */
  get increaseData() {
    if ( !this.isActorEmbedded ) return undefined;

    return {
      newLevel:   this.level + 1,
      requiredLp: this.requiredLpForIncrease,
    };
  }

  /**
   * @inheritDoc
   */
  get increaseRules() {
    return game.i18n.localize( "ED.Rules.devotionIncreaseShortRequirements" );
  }

  /**
   * @inheritDoc
   */
  get requiredLpForIncrease() {
    // devotion lp costs are equivalent to first discipline talents
    const tierModifier = ED4E.lpIndexModForTier[1][this.tier];

    return ED4E.legendPointsCost[
      this.level
    + 1 // new level
    +  tierModifier
    ];
  }

  /**
   * @inheritDoc
   */
  get requiredMoneyForIncrease() {
    return 0;
  }

  /**
   * @inheritDoc
   */
  get increaseValidationData() {
    if ( !this.isActorEmbedded ) return undefined;

    const increaseData = this.increaseData;
    return {
      [ED4E.validationCategories.base]: [
        {
          name:      "ED.Legend.Validation.maxLevel",
          value:     increaseData.newLevel,
          fulfilled: increaseData.newLevel <= game.settings.get( "ed4e", "lpTrackingMaxRankSkill" ),
        },
      ],
      [ED4E.validationCategories.resources]: [
        {
          name:      "ED.Legend.Validation.availableLp",
          value:     increaseData.requiredLp,
          fulfilled: this.parentActor.currentLp >= increaseData.requiredLp,
        },
        {
          name:      "ED.Legend.Validation.availableMoney",
          value:     this.requiredMoneyForIncrease,
          fulfilled: this.parentActor.currentSilver >= this.requiredMoneyForIncrease,
        },
      ],
    };
  }

  /**
   * @inheritDoc
   */
  async increase() {
    const updatedDevotion = await super.increase();
    if ( !updatedDevotion || !this.isActorEmbedded ) return undefined;

    // update the corresponding questor item
    const questorItem = this.parentActor.itemTypes.questor.find(
      ( item ) => item.system.questorDevotion === this.parent.uuid
    );
    if ( !questorItem ) return updatedDevotion;

    const content =  `
        <p>
          ${game.i18n.format( "ED.Dialogs.Legend.increaseQuestorPrompt.Do you wanna increase this corresponding questor:" )}
        </p>
        <p>
          ${createContentLink( questorItem.uuid, questorItem.name )}
        </p>
      `;
    const increaseQuestor = await DialogV2.confirm( {
      rejectClose: false,
      content:     await TextEditor.enrichHTML( content ),
    } );
    if ( increaseQuestor && !(
      await questorItem.update( { "system.level": updatedDevotion.system.level } )
    ) ) ui.notifications.warn( "ED.Notifications.Warn.questorItemNotUpdated WithDevotion" );

    return updatedDevotion;
  }

  static async learn( actor, item, createData = {} ) {
    const learnedItem = await super.learn( actor, item, createData );
    if ( !learnedItem.system.tier )await learnedItem.system.chooseTier();
    return learnedItem;
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    const oldTargetDefense = [ "", "physicaldefense", "mysticaldefense", "socialdefense" ];
    const newTargetDefense = [ "", "physical", "mystical", "social" ];
    const oldGroupDifficulty = [ "", "defenseLow", "defenseLowPlus", "defenseHigh", "defenseHighPlus" ];
    const newGroupDifficulty = [ "", "lowestOfGroup", "lowestX", "highestOfGroup", "highestX" ];
    const oldAttributes = [ "", "dexterityStep", "strengthStep", "toughnessStep", "perceptionStep", "willpowerStep", "charismaStep", "initiativeStep" ];
    const newAttributes = [ "", "dex", "str", "tou", "per", "wil", "cha", "" ];
    const oldActions = [ "", "Standard", "Simple", "Free", "Sustained" ];
    const newActions = [ "", "standard", "simple", "free", "sustained" ];
    const oldTiers = [ "", "Novice", "Journeyman", "Warden", "Master" ];
    const newTiers = [ "", "novice", "journeyman", "warden", "master" ];
    
    // Migrate action (ok)
    if ( oldActions.includes( source.action ) ) {
      source.action = newActions[oldActions.indexOf( source.action )];
    }
  
    // Migrate tier (to be checked with actors)
    if ( oldTiers.includes( source.tier ) ) {
      source.tier = newTiers[oldTiers.indexOf( source.tier )];
    }
  
    // Migrate defense target (ok)
    if ( oldTargetDefense.includes( source.defenseTarget ) && source.defenseTarget !== "" && source.difficulty?.target === undefined ) {
      if ( oldGroupDifficulty.includes( source.defenseGroup ) && source.difficulty?.group === undefined ) {
        source.difficulty = {
          ...source.difficulty,
          target: newTargetDefense[oldTargetDefense.indexOf( source.defenseTarget )],
          group:  newGroupDifficulty[oldGroupDifficulty.indexOf( source.defenseGroup )]
        };
      } else {
        source.difficulty = {
          ...source.difficulty, // Spread the existing properties of source.difficulty
          target: newTargetDefense[oldTargetDefense.indexOf( source.defenseTarget )], // Update the target property
        };
      }
    }

    // set rollType for recovery (ok)
    if ( source.healing > 0 ) {
      if ( source.rollType === undefined ) {
        source.rollType = "recovery";
      }
    } 
  
    // Migrate attribute (ok)
    if ( oldAttributes.includes( source.attribute ) ) {
      if ( source.attribute === "initiativeStep" ) {
        source.rollType = "initiative";
      } 
      source.attribute = newAttributes[oldAttributes.indexOf( source.attribute )];
    }
  
    // Migrate rank to level (it only works in an if statement not as a one line ?: statement)
    if ( source.ranks > 0 && source.level === undefined ) {
      source.level = source.ranks;
    }

    // Migrate description
    if ( typeof source.description === "string" ) {
      source.description = { value: source.description };
    }
  }
}
