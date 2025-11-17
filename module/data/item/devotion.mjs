import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ED4E from "../../config/_module.mjs";
import { createContentLink } from "../../utils.mjs";
import IncreasableAbilityTemplate from "./templates/increasable-ability.mjs";
import DialogEd from "../../applications/api/dialog.mjs";

/**
 * Data model template with information on Devotion items.
 */
export default class DevotionData extends IncreasableAbilityTemplate.mixin(
  ItemDescriptionTemplate
)  {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      devotionRequired: new fields.BooleanField( {
        required: true,
        initial:  false,
      } ),
      durability: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Devotion",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: "devotion",
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

    return {
      newLevel:   this.unmodifiedLevel + 1,
      requiredLp: this.requiredLpForIncrease,
    };
  }

  /**
   * @inheritDoc
   */
  get increaseRules() {
    return game.i18n.localize( "ED.Dialogs.Legend.Rules.devotionIncreaseShortRequirements" );
  }

  /**
   * @inheritDoc
   */
  get requiredLpForIncrease() {
    // devotion lp costs are equivalent to first discipline talents
    const tierModifier = ED4E.lpIndexModForTier[1][this.tier];

    return ED4E.legendPointsCost[
      this.unmodifiedLevel
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
          name:      "ED.Dialogs.Legend.Validation.maxLevel",
          value:     increaseData.newLevel,
          fulfilled: increaseData.newLevel <= game.settings.get( "ed4e", "lpTrackingMaxRankSkill" ),
        },
      ],
      [ED4E.validationCategories.resources]: [
        {
          name:      "ED.Dialogs.Legend.Validation.availableLp",
          value:     increaseData.requiredLp,
          fulfilled: this.containingActor.currentLp >= increaseData.requiredLp,
        },
      ],
      [ED4E.validationCategories.health]:    [
        {
          name:      "ED.Dialogs.Legend.Validation.hasDamage",
          value:     increaseData.hasDamage ? game.i18n.localize( "ED.Dialogs.Legend.Validation.hasDamage" ) : game.i18n.localize( "ED.Dialogs.Legend.Validation.hasNoDamage" ),
          fulfilled: !increaseData.hasDamage,
        },
        {
          name:      "ED.Dialogs.Legend.Validation.hasWounds",
          value:     increaseData.hasWounds ? game.i18n.localize( "ED.Dialogs.Legend.Validation.hasWounds" ) : game.i18n.localize( "ED.Dialogs.Legend.Validation.hasNoWounds" ),
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
    const updatedDevotion = await super.increase();
    if ( !updatedDevotion || !this.isActorEmbedded ) return undefined;

    // update the corresponding questor item
    const questorItem = this.containingActor.itemTypes.questor.find(
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
    const increaseQuestor = await DialogEd.confirm( {
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
