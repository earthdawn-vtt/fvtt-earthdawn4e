import TargetTemplate from "./targeting.mjs";
import LearnableTemplate from "./learnable.mjs";
import { ConstraintData } from "../../common/restrict-require.mjs";
import EdIdField from "../../fields/edid-field.mjs";
import PromptFactory from "../../../applications/global/prompt-factory.mjs";
import ED4E from "../../../config/_module.mjs";
import SystemDataModel from "../../abstract/system-data-model.mjs";

/**
 * Data model template for Knacks
 * @property {string} knackSource     UUID of Source the knack derives from
 */
export default class KnackTemplate extends SystemDataModel.mixin( 
  LearnableTemplate,
  TargetTemplate,
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Knack",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      sourceItem: new EdIdField(),
      minLevel:         new fields.NumberField( {
        required: true,
        positive: true,
        integer:  true,
        initial:  1,
      } ),
      lpCost:           new fields.NumberField( {
        required: false,
        positive: true,
        integer:  true,
      } ),
      requirements:     new fields.ArrayField(
        new fields.TypedSchemaField( ConstraintData.TYPES ) ),
    } );
  }

  /* -------------------------------------------- */
  /*  LP Tracking                                 */
  /* -------------------------------------------- */

  /** @inheritDoc */
  get canBeLearned() {
    return true;
  }

  /** @inheritDoc */
  get learnable() {
    return true;
  }
 

  /**
   * @inheritDoc
   */
  get learnData() {
    const actor = this.parent._actor;

    return {
      talent:     actor.itemTypes.talent.find( ( talent ) => talent.system.edid === this.sourceItem ),
      requiredLp: this.requiredLpForLearning,
      hasDamage:  actor.hasDamage( "standard" ),
      hasWounds:  actor.hasWounds( "standard" ),
      actor:      actor,
    };
  }

  /**
   * @inheritDoc
   */
  get requiredLpForLearning() {
    // if no fixed lp cost is configured, use the default cost of a novice talent of the same rank as the min level.
    if ( !this.lpCost ) {
      return ED4E.legendPointsCost[
        this.minLevel
      ];
    } else {
      return this.lpCost;
    }
  }

  /**
   * @inheritDoc
   */
  get requiredMoneyForLearning() {
    return ( this.minLevel ) * 50;
  }

  /** @inheritdoc */
  get learnValidationData () {

    const learnData = this.learnData;
    return {
      [ED4E.validationCategories.talentsRequirement]: [
        {
          name:      "ED.Dialogs.Legend.Validation.sourceTalentName",
          value:     learnData.talent.name,
          fulfilled: learnData.talent.isEmbedded
        },
        {
          name:      "ED.Dialogs.Legend.Validation.sourceTalentRank",
          value:     this.minLevel,
          fulfilled: learnData.talent.system.level >= this.minLevel
        },
      ],
      [ED4E.validationCategories.resources]: [
        {
          name:      "ED.Dialogs.Legend.Validation.availableLp",
          value:     this.requiredLpForLearning,
          fulfilled: this.requiredLpForLearning <= learnData.actor.currentLp,
        },
        {
          name:      "ED.Dialogs.Legend.Validation.availableMoney",
          value:     this.requiredMoneyForLearning,
          fulfilled: this.requiredMoneyForLearning <= learnData.actor.currentSilver,
        },
      ],
      [ED4E.validationCategories.health]:    [
        {
          name:      "ED.Dialogs.Legend.Validation.hasDamage",
          value:     learnData.hasDamage,
          fulfilled: !learnData.hasDamage,
        },
        {
          name:      "ED.Dialogs.Legend.Validation.hasWounds",
          value:     learnData.hasWounds,
          fulfilled: !learnData.hasWounds,
        },
      ],
    };
  }

  /** @inheritDoc */
  static async learn( actor, item, createData = {} ) {
    if ( !item.system.canBeLearned ) {
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.cannotLearn" ) );
      return;
    }

    const parentTalent = actor.itemTypes.talent.find( ( talent ) => talent.system.edid === item.system.sourceItem );
    if ( !parentTalent ) {
      const talentSourceEdid = item.system.sourceItem;
      ui.notifications.warn( game.i18n.format(
        "ED.Notifications.Warn.noSourceTalent",
        { talentSourceEdid: talentSourceEdid },
      ) );
      return;
    }

    const learnData = item;
    learnData._actor = actor;

    let learn = null;

    const promptFactoryItem = await PromptFactory.fromDocument( learnData );
    learn = await promptFactoryItem.getPrompt( "learnKnack" );

    if ( !learn || learn === "cancel" || learn === "close" ) return;

    // Use super.learn to create the item with the basic logic
    const learnedItem = await super.learn( actor, item, createData );

    const updatedActor = await actor.addLpTransaction(
      "spendings",
      {
        amount:      learn === "spendLp" ? item.system.requiredLpForLearning : 0,
        description: game.i18n.format(
          "ED.Actor.LpTracking.Spendings",
        ),
        entityType:  learnedItem.type,
        name:       learnedItem.name,
        itemUuid:   learnedItem.uuid,
      },
    );

    if ( foundry.utils.isEmpty( updatedActor ) )
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.addLpTransactionProblems" )
      );

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