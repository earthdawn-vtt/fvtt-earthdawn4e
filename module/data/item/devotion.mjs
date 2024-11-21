import AbilityTemplate from "./templates/ability.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ED4E from "../../config.mjs";
import { createContentLink } from "../../utils.mjs";
const { DialogV2 } = foundry.applications.api;

/**
 * Data model template with information on Devotion items.
 */
export default class DevotionData extends AbilityTemplate.mixin(
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
    await learnedItem.system.chooseTier();
    return learnedItem;
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    super.migrateData( source );
    // specific migration functions
  }
}
