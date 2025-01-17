import PromptFactory from "../../applications/global/prompt-factory.mjs";
import ED4E from "../../config.mjs";
import { SparseDataModel } from "../abstract.mjs";
import LpSpendingTransactionData from "../advancement/lp-spending-transaction.mjs";
import LpIncreaseTemplate from "../item/templates/lp-increase.mjs";
import ThreadLevelData from "./thread-level.mjs";

export default class ThreadBaseData extends SparseDataModel {
  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      isIdentified: new fields.BooleanField( {
        required: true,
        initial:  false,
        // label:    this.labelKey( "PhysicalItems.ThreadItem.isIdentified" ),
        // hint:     this.hintKey( "PhysicalItems.ThreadItem.isIdentified" )
        label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.isIdentified",
        hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.isIdentified"
      } ),
      isAnalysed: new fields.BooleanField( {
        required: true,
        initial:  false,
        // label:    this.labelKey( "PhysicalItems.ThreadItem.isAnalysed" ),
        // hint:     this.hintKey( "PhysicalItems.ThreadItem.isAnalysed" )
        label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.isAnalysed",
        hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.isAnalysed"
      } ),
      // to be aligned with the path of actor mystical defense
      characteristics: new fields.SchemaField( {
        defenses: new fields.SchemaField( {
          mystical: new fields.SchemaField( { 
            baseValue: new fields.NumberField( {
              required: true,
              nullable: false,
              min:      0,
              step:     1,
              initial:  0,
              integer:  true,
            } ),
            value: new fields.NumberField( {
              required: true,
              nullable: false,
              min:      0,
              step:     1,
              initial:  0,
              integer:  true,
              // label:    this.labelKey( "PhysicalItems.ThreadItem.mysticalDefense" ),
              // hint:     this.hintKey( "PhysicalItems.ThreadItem.mysticalDefense" )
              label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.mysticalDefense",
              hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.mysticalDefense"
            } ),
          } ),
        } ),
      } ),
      maxThreads:         new fields.NumberField( { 
        required: true,
        nullable: false,
        min:      1,
        step:     1,
        initial:  1,
        integer:  true,
        // label:    this.labelKey( "PhysicalItems.ThreadItem.maxThreads" ),
        // hint:     this.hintKey( "PhysicalItems.ThreadItem.maxThreads" )
        label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.maxThreads",
        hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.maxThreads"
      } ),
      tier:               new fields.StringField( { 
        required: true,
        nullable: false,
        initial:  "novice",
        choices:  ED4E.tier,
        // label:    this.labelKey( "PhysicalItems.ThreadItem.tier" ),
        // hint:     this.hintKey( "PhysicalItems.ThreadItem.tier" )
        label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.tier",
        hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.tier"
      } ),
      enchantmentPattern: new fields.DocumentUUIDField( {
        required: true,
        nullable: true,
        initial:  null,
        // label:    this.labelKey( "PhysicalItems.ThreadItem.enchantmentPattern" ),
        // hint:     this.hintKey( "PhysicalItems.ThreadItem.enchantmentPattern" )
        label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.enchantmentPattern",
        hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.enchantmentPattern"
      } ),
      levels:     new fields.ArrayField(
        new fields.EmbeddedDataField(
          ThreadLevelData,
          {
            required: false,
            nullable: true,
            // label:    this.labelKey( "PhysicalItems.ThreadItem.threadlevel" ),
            // hint:     this.hintKey( "PhysicalItems.ThreadItem.threadlevel" )
            label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.threadlevel",
            hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.threadlevel"
          }
        ),
        {
          required: true,
          nullable: true,
          initial:  [],
        } ),
        
    };
  }

  /**
   * Add a new level to this advancement.
   * @param {object} [data]    If provided, will initialize the new level with the given data.
   */
  addLevel( data = {} ) {
    this.parent.parent.update( {
      "system.threadData.levels": this.levels.concat(
        new ThreadLevelData(
          {
            ...data,
            level: this.levels.length + 1
          }
        )
      )
    } );
  }
  
  /**
   * Remove the last {@link amount} levels added from this advancement.
   * @param {number} [amount]   The number of levels to remove.
   */
  deleteLevel( amount = 1 ) {
    this.parent.parent.update( {
      "system.threadData.levels": this.levels.slice( 0, -( amount ?? 1 ) )
    } );
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    super.migrateData( source );
    // specific migration functions
  }

  /**
   * @inheritDoc
   */
  get requiredLpForIncrease() {
    const threadItem = this.parent;
    if ( !threadItem.isActorEmbedded ) return undefined;
    const activeThreads = threadItem.threadData.levels.filter( level => level.isActive ).length;
    const currentLevel = activeThreads > 0 ? activeThreads : 0;
    const tierModifier = ED4E.lpIndexModForTier[1][threadItem.threadData.tier];
    return ED4E.legendPointsCost[ currentLevel + 1 + tierModifier ];
  }
  
  /**
   * @inheritDoc
   */
  get increaseData() {
    if ( !this.parent.isActorEmbedded ) return undefined;
    const actor = this.parent.parentActor;
  
    return {
      hasDamage:  actor.hasDamage( "standard" ),
      hasWounds:  actor.hasWounds( "standard" ),
    };
  }
  
  /**
   * @inheritDoc
   */
  get increaseRules() {
    return game.i18n.localize( "ED.Dialogs.Legend.Rules.threadItemIncreaseShortRequirements" );
  }
  
  /**
   * @inheritDoc
   */
  get increaseValidationData() {
    if ( !this.parent.isActorEmbedded ) return undefined;
    
    const increaseData = this.increaseData;
    return {
      [ED4E.validationCategories.resources]: [
        {
          name:      "ED.Dialogs.Legend.Validation.availableLp",
          value:     this.requiredLpForIncrease,
          fulfilled: this.requiredLpForIncrease <= this.parent.parent.actor.currentLp,
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
    const actor = this.parent.parentActor;
    for ( const level of this.levels ) {
      if ( level.isActive === false ) {
        const promptFactory = PromptFactory.fromDocument( this.parent.parent );
        const spendLp = await promptFactory.getPrompt( "lpIncrease" );

        if ( !spendLp
          || spendLp === "cancel"
          || spendLp === "close" ) break;

        const updateData = this.toObject().levels;
        const currentLevelIndex = level.level-1;
        updateData[currentLevelIndex].isActive = true;
        // Find the threadItem in the actor's items
        const threadItem = actor.items.find( item => item.id === this.parent.parent.id );
        if ( !threadItem ) {
          ui.notifications.warn(
            game.i18n.localize( "ED.Notifications.Warn.Legend.threadItemNotFound" )
          );
          return;
        }

        // Update the threadItem
        const updatedItem = await actor.updateEmbeddedDocuments( "Item", [ {
          _id:                        threadItem.id,
          "system.threadData.levels": updateData
        } ] );

        if ( foundry.utils.isEmpty( updatedItem ) ) {
          ui.notifications.warn(
            game.i18n.localize( "ED.Notifications.Warn.Legend.threadItemIncreaseProblems" )
          );
          return;
        }

        const updatedActor = await actor.addLpTransaction(
          "spendings",
          LpSpendingTransactionData.dataFromLevelItem(
            this.parent.parent,
            spendLp === "spendLp" ? this.requiredLpForIncrease : 0,
            LpIncreaseTemplate.lpSpendingDescription,
          ),
        );

        if ( foundry.utils.isEmpty( updatedActor ) )
          ui.notifications.warn(
            game.i18n.localize( "ED.Notifications.Warn.Legend.threadItemIncreaseProblems" )
          );

        // this ends the loop and the function - only one thread per click  
        break;
      } 
    }
    return actor;
  }
}
