import TargetTemplate from "./targeting.mjs";
import LearnableTemplate from "./learnable.mjs";
import { ConstraintData } from "../../common/restrict-require.mjs";
import EdIdField from "../../fields/edid-field.mjs";
import PromptFactory from "../../../applications/global/prompt-factory.mjs";
import SystemDataModel from "../../abstract/system-data-model.mjs";
import { SYSTEM_TYPES } from "../../../constants/constants.mjs";
import * as LEGEND from "../../../config/legend.mjs";
import TypedEntryManagerMixin from "../../common/typed-entry-manager.mjs";


/**
 * @import { KnackTemplateData } from "./_types.mjs";
 */

/**
 * Data model template for knack items derived from a source item (usually a talent).
 * @augments {SystemDataModel<KnackTemplateData>}
 * @mixes LearnableTemplate
 * @mixes TargetTemplate
 * @mixes TypedEntryManagerMixin
 * @mixin
 * @see {@link KnackTemplateData} The system data model for this template.
 */
export default class KnackTemplate extends SystemDataModel.mixin( 
  LearnableTemplate,
  TargetTemplate,
  TypedEntryManagerMixin,
) {

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Knack",
  ];

  /**
   * The type of knack this template is used for.
   * @type {string}
   * @abstract
   */
  static SOURCE_ITEM_TYPE;

  static ENTRY_DATA_CLASS = ConstraintData;

  static FIELD_NAMES = [ "requirements", "restrictions" ];

  // endregion

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      sourceItem:       new EdIdField(),
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
      requirements:     new fields.TypedObjectField(
        new fields.TypedSchemaField( ConstraintData.TYPES )
      ),
      restrictions:     new fields.TypedObjectField(
        new fields.TypedSchemaField( ConstraintData.TYPES )
      ),
    } );
  }

  // endregion

  // region Checkers

  /**
   * Check whether the creation or update data changes the source item of the knack.
   * @param {object} update The create or update data
   * @returns {boolean} True if the source item is changed, false otherwise
   */
  _isChangingSourceItem( update ) {
    const data = foundry.utils.expandObject( update );
    const newEdid = data?.system?.sourceItem;

    return newEdid && newEdid !== this.sourceItem;
  }

  // endregion

  // region Rolling

  /** @inheritDoc */
  getRollData() {
    return {
      knackMinLevel:   this.minLevel,
      knackMinRank:    this.minLevel,
      knackLpCost:     this.lpCost,
    };
  }

  // endregion

  // region LP Tracking

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
      talent:     actor.getSingleItemByEdid( this.sourceItem, SYSTEM_TYPES.Item.talent ),
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
      return LEGEND.legendPointsCost[
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
      [LEGEND.validationCategories.talentsRequirement]: [
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
      [LEGEND.validationCategories.resources]: [
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
      [LEGEND.validationCategories.health]:    [
        {
          name:      "ED.Dialogs.Legend.Validation.hasDamage",
          value:     learnData.hasDamage ? _loc( "ED.Dialogs.Legend.Validation.hasDamage" ) : _loc( "ED.Dialogs.Legend.Validation.hasNoDamage" ),
          fulfilled: !learnData.hasDamage,
        },
        {
          name:      "ED.Dialogs.Legend.Validation.hasWounds",
          value:     learnData.hasWounds ? _loc( "ED.Dialogs.Legend.Validation.hasWounds" ) : _loc( "ED.Dialogs.Legend.Validation.hasNoWounds" ),
          fulfilled: !learnData.hasWounds,
        },
      ],
    };
  }

  /** @inheritDoc */
  static async learn( actor, item, createData = {} ) {
    if ( !item.system.canBeLearned ) {
      ui.notifications.warn( _loc( "ED.Notifications.Warn.cannotLearn" ) );
      return;
    }

    if ( !actor.getSingleItemByEdid(
      item.system.sourceItem,
      this.SOURCE_ITEM_TYPE ?? SYSTEM_TYPES.Item.talent,
    ) ) {
      ui.notifications.warn( _loc(
        "ED.Notifications.Warn.learningKnackNoSourceItem",
        { sourceItemEdid: item.system.sourceItem },
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
        description: _loc(
          "ED.Actor.LpTracking.Spendings.learnKnack", {
            name: item.name,
          }
        ),
        entityType:  learnedItem.type,
        name:        learnedItem.name,
        itemId:      learnedItem.id,
      },
    );

    if ( foundry.utils.isEmpty( updatedActor ) )
      ui.notifications.warn(
        _loc( "ED.Notifications.Warn.addLpTransactionProblems" )
      );

    return learnedItem;
  }

  // endregion

  // region Methods

  /** @inheritDoc */
  _getFieldPathToAddTypedEntry( fieldName, entryType ) {
    return `system.${ fieldName }.${ this._getNewEntryKey( fieldName, entryType ) }`;
  }

  // endregion

  // region Migration

  /** @inheritDoc */
  static migrateData( source ) {
    return super.migrateData( source );
    // specific migration functions
  }

  // endregion
}