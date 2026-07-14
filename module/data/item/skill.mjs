import ItemDescriptionTemplate from "./templates/item-description.mjs";
import IncreasableAbilityTemplate from "./templates/increasable-ability.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";
import * as LEGEND from "../../config/legend.mjs";
import { getSetting } from "../../helpers/settings.mjs";

/**
 * @import { SkillSystemData } from "./_types.mjs";
 */

/**
 * Data model for skill items.
 * @augments {IncreasableAbilityTemplate<SkillSystemData>}
 * @mixes ItemDescriptionTemplate
 * @see {@link SkillSystemData} The system data model for skill items.
 */
export default class SkillData extends IncreasableAbilityTemplate.mixin(
  ItemDescriptionTemplate
)  {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      skillType: new fields.StringField( {
        required: true,
        initial:  "general",
        choices:  LEGEND.skillTypes,
      } ),
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Skill",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: SYSTEM_TYPES.Item.skill,
    }, {
      inplace: false
    },
  ) );

  // endregion

  // region Getters

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
      newLevel:   this.unmodifiedLevel + 1,
      requiredLp: this.requiredLpForIncrease,
      hasDamage:  actor.hasDamage( "standard" ),
      hasWounds:  actor.hasWounds( "standard" ),
    };
  }

  /**
   * @inheritDoc
   */
  get increaseRules() {
    const trainingTime = LEGEND.trainingTime[this.unmodifiedLevel];
    return _loc(
      "ED.Dialogs.Legend.Rules.skillIncreaseShortRequirements",
      { trainingTime: trainingTime }
    );
  }

  /**
   * @inheritDoc
   */
  get requiredLpForIncrease() {
    // skill lp costs are equivalent to second discipline talents
    const tierModifier = LEGEND.lpIndexModForTier[2][this.tier];

    return LEGEND.legendPointsCost[
      this.unmodifiedLevel
    + 1 // new level
    +  tierModifier
    ];
  }

  /**
   * @inheritDoc
   */
  get requiredMoneyForIncrease() {
    return ( this.unmodifiedLevel + 1 ) * 10;
  }

  /**
   * @inheritDoc
   */
  get increaseValidationData() {
    if ( !this.isActorEmbedded ) return undefined;

    const increaseData = this.increaseData;
    return {
      [LEGEND.validationCategories.base]:      [
        {
          name:      "ED.Dialogs.Legend.Validation.maxLevel",
          value:     increaseData.newLevel,
          fulfilled: increaseData.newLevel <= getSetting( "lpTrackingMaxRankSkill" ),
        },
      ],
      [LEGEND.validationCategories.resources]: [
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
      [LEGEND.validationCategories.health]:    [
        {
          name:      "ED.Dialogs.Legend.Validation.hasDamage",
          value:     increaseData.hasDamage ? _loc( "ED.Dialogs.Legend.Validation.hasDamage" ) : _loc( "ED.Dialogs.Legend.Validation.hasNoDamage" ),
          fulfilled: !increaseData.hasDamage,
        },
        {
          name:      "ED.Dialogs.Legend.Validation.hasWounds",
          value:     increaseData.hasWounds ? _loc( "ED.Dialogs.Legend.Validation.hasWounds" ) : _loc( "ED.Dialogs.Legend.Validation.hasNoWounds" ),
          fulfilled: !increaseData.hasWounds,
        },
      ],
    };
  }

  // endregion

  // region LP Tracking

  /**
   * @inheritDoc
   */
  async increase() {
    return super.increase();
  }

  // endregion

  // region Rolling

  /** @inheritDoc */
  getRollData() {
    const rollData = super.getRollData();
    Object.assign( rollData, super.getTemplatesRollData() );
    return Object.assign( rollData, {} );
  }

  // endregion

}