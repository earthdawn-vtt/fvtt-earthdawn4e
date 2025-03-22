import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ED4E from "../../config/_module.mjs";
import IncreasableAbilityTemplate from "./templates/increasable-ability.mjs";

/**
 * Data model template with information on Skill items.
 * @mixes ItemDescriptionTemplate
 */
export default class SkillData extends IncreasableAbilityTemplate.mixin(
  ItemDescriptionTemplate
)  {

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      skillType: new fields.StringField( {
        required: true,
        initial:  "general",
        choices:  ED4E.skillTypes,
        label:    this.labelKey( "Ability.skillType" ),
        hint:     this.hintKey( "Ability.skillType" )
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
    const actor = this.parent.actor;

    return {
      newLevel:   this.level + 1,
      requiredLp: this.requiredLpForIncrease,
      hasDamage:  actor.hasDamage( "standard" ),
      hasWounds:  actor.hasWounds( "standard" ),
    };
  }

  /**
   * @inheritDoc
   */
  get increaseRules() {
    return game.i18n.localize( "ED.Rules.skillIncreaseShortRequirements" );
  }

  /**
   * @inheritDoc
   */
  get requiredLpForIncrease() {
    // skill lp costs are equivalent to second discipline talents
    const tierModifier = ED4E.lpIndexModForTier[2][this.tier];

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
    return ( this.level + 1 ) * 10;
  }

  /**
   * @inheritDoc
   */
  get increaseValidationData() {
    if ( !this.isActorEmbedded ) return undefined;

    const increaseData = this.increaseData;
    return {
      [ED4E.validationCategories.base]:      [
        {
          name:      "ED.Dialogs.Legend.Validation.maxLevel",
          value:     increaseData.newLevel,
          fulfilled: increaseData.newLevel <= game.settings.get( "ed4e", "lpTrackingMaxRankSkill" ),
        },
      ],
      [ED4E.validationCategories.resources]: [
        {
          name:      "ED.Dialogs.Legend.Validation.availableLp",
          value:     this.requiredLpForIncrease,
          fulfilled: this.requiredLpForIncrease <= this.parent.actor.currentLp,
        },
        {
          name:      "ED.Dialogs.Legend.Validation.availableMoney",
          value:     this.requiredMoneyForIncrease,
          fulfilled: this.requiredMoneyForIncrease <= this.parent.actor.currentSilver,
        },
      ],
      [ED4E.validationCategories.health]:    [
        {
          name:      "ED.Dialogs.Legend.Validation.hasDamage",
          value:     increaseData.hasDamage,
          fulfilled: !increaseData.hasDamage,
        },
        {
          name:      "ED.Dialogs.Legend.Validation.hasWounds",
          value:     increaseData.hasWounds,
          fulfilled: !increaseData.hasWounds,
        },
      ],
    };
  }

  /**
   * @inheritDoc
   */
  async increase() {
    return super.increase();
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