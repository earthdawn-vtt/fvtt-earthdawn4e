import SystemDataModel from "../../abstract.mjs";
import TargetTemplate from "./targeting.mjs";
import LearnableTemplate from "./learnable.mjs";
import { ConstraintData } from "../../common/restrict-require.mjs";
import EdIdField from "../../fields/edid-field.mjs";
import PromptFactory from "../../../applications/global/prompt-factory.mjs";
import ED4E from "../../../config/_module.mjs";

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
      sourceTalent: new EdIdField( {
        label:           this.labelKey( "Knack.sourceTalent" ),
        hint:            this.hintKey( "Knack.sourceTalent" ),
      } ),
      minLevel:         new fields.NumberField( {
        required: true,
        positive: true,
        integer:  true,
        initial:  1,
        label:    this.labelKey( "Knack.minLevel" ),
        hint:     this.hintKey( "Knack.minLevel" ),
      } ),
      lpCost:           new fields.NumberField( {
        required: false,
        positive: true,
        integer:  true,
        label:    this.labelKey( "Knack.lpCost" ),
        hint:     this.hintKey( "Knack.lpCost" ),
      } ),
      restrictions:     new fields.ArrayField(
        new fields.TypedSchemaField( ConstraintData.TYPES ),
        {
          label: this.labelKey( "Knack.restrictions" ),
          hint:  this.hintKey( "Knack.restrictions" ),
        }
      ),
      requirements:     new fields.ArrayField(
        new fields.TypedSchemaField( ConstraintData.TYPES ),
        {
          label: this.labelKey( "Knack.requirements" ),
          hint:  this.hintKey( "Knack.requirements" ),
        }
      ),
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
      talent:     actor.itemTypes.talent.find( ( talent ) => talent.system.edid === this.sourceTalent ),
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
          name:      "ED.Dialogs.Legend.Validation.sourceTalentname",
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

    const parentTalent = actor.itemTypes.talent.find( ( talent ) => talent.system.edid === item.system.sourceTalent );
    if ( !parentTalent ) {
      const talentSourceEdid = item.system.sourceTalent;
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

    // const learnedItem = await super.learn( actor, item, createData );

    const itemData = foundry.utils.mergeObject(
      learnData.toObject(),
      foundry.utils.expandObject( createData ),
    );
    await actor.createEmbeddedDocuments( "Item", [ itemData ] ) ?.[0];

    const updatedActor = await actor.addLpTransaction(
      "spendings",
      {
        amount:      learn === "spendLp" ? item.system.requiredLpForLearning : 0,
        description: game.i18n.format(
          "ED.Actor.LpTracking.Spendings",
        ),
        entityType:  learnData.type,
        name:       learnData.name,
        itemUuid:   learnData.uuid,
      },
    );

    if ( foundry.utils.isEmpty( updatedActor ) )
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.addLpTransactionProblems" )
      );

    return learnData;
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