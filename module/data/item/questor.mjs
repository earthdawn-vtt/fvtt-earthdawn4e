import ClassTemplate from "./templates/class.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import { createContentLink, getSingleGlobalItemByEdid } from "../../utils.mjs";
import ED4E from "../../config/_module.mjs";
import PromptFactory from "../../applications/global/prompt-factory.mjs";
import LpSpendingTransactionData from "../advancement/lp-spending-transaction.mjs";
const { DialogV2 } = foundry.applications.api;

/**
 * Data model template with information on the questor path items.
 */
export default class QuestorData extends ClassTemplate.mixin(
  ItemDescriptionTemplate
) {

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      questorDevotion: new fields.DocumentUUIDField( {
        required: true,
        nullable: true,
        type:     "Item",
        validate: ( value, options ) => {
          const item = fromUuidSync( value, {strict: false} );
          if ( item.system?.edid !== game.settings.get( "ed4e", "edidQuestorDevotion" ) ) return false;
          return undefined;
        },
        validationError: "must be a questor talent with the questor edId.",
        label:           this.labelKey( "Questor.questorDevotion" ),
        hint:            this.hintKey( "Questor.questorDevotion" ),
      } ),
    } );
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  static metadata = Object.freeze( foundry.utils.mergeObject( super.metadata, {
    hasLinkedItems: true,
  }, {inplace: false} ) );


  /* -------------------------------------------- */
  /*  LP Tracking                                 */
  /* -------------------------------------------- */

  /** @inheritDoc */
  get canBeLearned() {
    return true;
  }

  /** @inheritDoc */
  get increaseRules() {
    return game.i18n.localize( "ED.Legend.Rules.questorClassIncreaseShortRequirements" );
  }

  /** @inheritDoc */
  get increaseValidationData() {
    if ( !this.isActorEmbedded ) return undefined;

    return {
      [ED4E.validationCategories.base]:               [
        {
          name:      "ED.Dialogs.Legend.Validation.availableLp",
          value:     this.requiredLpForIncrease,
          fulfilled: this.requiredLpForIncrease <= this.parentActor.currentLp,
        },
      ],
    };
  }

  get requiredLpForIncrease() {
    // Questor devotion is treated as a journeyman talent
    return ED4E.legendPointsCost[ this.level + 1 + ED4E.lpIndexModForTier[1].journeyman ];
  }

  /** @inheritDoc */
  async increase() {
    if ( !this.isActorEmbedded ) return;

    const nextLevel = this.level + 1;
    const updatedQuestor = await super.increase();
    if ( updatedQuestor?.system.level !== nextLevel ) {
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.Legend.classIncreaseProblems" )
      );
      return;
    }

    const promptFactory = PromptFactory.fromDocument( this.parent );
    const spendLp = await promptFactory.getPrompt( "lpIncrease" );

    if ( !spendLp
      || spendLp === "cancel"
      || spendLp === "close" ) return;

    const updatedActor = await this.parent.actor.addLpTransaction(
      "spendings",
      LpSpendingTransactionData.dataFromLevelItem(
        this.parent,
        spendLp === "spendLp" ? this.requiredLpForIncrease : 0,
        this.lpSpendingDescription,
      ),
    );

    if ( foundry.utils.isEmpty( updatedActor ) )
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.Legend.abilityIncreaseProblems" )
      );

    // possibly update the associated devotion
    const questorDevotion = await fromUuid( this.questorDevotion );
    if ( !questorDevotion ) return this.parent;

    const content =  `
        <p>
          ${game.i18n.format( "ED.Dialogs.Legend.increaseQuestorDevotionPrompt" )}
        </p>
        <p>
          ${createContentLink( questorDevotion.uuid, questorDevotion.name )}
        </p>
      `;
    const increaseDevotion = await DialogV2.confirm( {
      rejectClose: false,
      content:     await TextEditor.enrichHTML( content ),
    } );
    if ( increaseDevotion && !(
      await questorDevotion.update( { "system.level": nextLevel } )
    ) ) ui.notifications.warn( "ED.Notifications.Warn.Legend.questorItemNotUpdated" );

    return this.parent;
  }

  /** @inheritDoc */
  static async learn( actor, item, _ ) {
    if ( !item.system.canBeLearned ) {
      ui.notifications.warn(
        game.i18n.format( "ED.Notifications.Warn.Legend.cannotLearn", {itemType: item.type} )
      );
      return;
    }

    // get the questor devotion
    const edidQuestorDevotion = game.settings.get( "ed4e", "edidQuestorDevotion" );
    let questorDevotion = await fromUuid( item.system.questorDevotion );
    questorDevotion ??= await getSingleGlobalItemByEdid( edidQuestorDevotion, "devotion" );
    questorDevotion ??= await Item.create( ED4E.documentData.Item.devotion.questor );

    await questorDevotion.update( {
      system: {
        edid: edidQuestorDevotion,
      },
    } );

    // "Do you want to become a questor of <passion>? This will grant you the following devotion automatically:"
    const questorDevotionLink = questorDevotion
      ? createContentLink( questorDevotion.uuid, questorDevotion.name )
      : game.i18n.format( "ED.Dialogs.Legend.questorDevotionNotFound", { edid: edidQuestorDevotion } );
    const content = ` 
      <p>${game.i18n.format( "ED.Dialogs.Legend.learnQuestorPrompt", {passion: item.name,} ) }</p>
      <p>${ questorDevotionLink }</p>
      `;

    const learn = await DialogV2.confirm( {
      rejectClose: false,
      content:     await TextEditor.enrichHTML( content ),
    } );

    if ( !learn ) return;

    const questorDevotionData = questorDevotion?.toObject();
    questorDevotionData.name = `${questorDevotion.name} - ${item.name}`;
    questorDevotionData.system.level = 1;
    const learnedDevotion = ( await actor.createEmbeddedDocuments( "Item", [ questorDevotionData ] ) )?.[0];

    const questorItemData = item.toObject();
    questorItemData.system.level = 1;
    questorItemData.system.questorDevotion = learnedDevotion?.uuid;

    const learnedQuestor = ( await actor.createEmbeddedDocuments( "Item", [ questorItemData ] ) )?.[0];
    if ( !learnedDevotion || !learnedQuestor ) throw new Error(
      "Error learning questor item. Could not create embedded Items."
    );

    return learnedQuestor;
  }

  /* -------------------------------------------- */
  /*  Drop Events                                 */
  /* -------------------------------------------- */

  async _onDropDevotion( event, document ) {
    const questorItem = this.parent;
    await questorItem.update( {
      "system.questorDevotion": document.uuid,
    } );
    return true;
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