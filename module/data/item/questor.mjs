import ClassTemplate from "./templates/class.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import { createContentLink, getSingleGlobalItemByEdid } from "../../utils.mjs";
import PromptFactory from "../../applications/global/prompt-factory.mjs";
import LpSpendingTransactionData from "../advancement/lp-spending-transaction.mjs";
import DialogEd from "../../applications/api/dialog.mjs";
import * as LEGEND from "../../config/legend.mjs";
import * as DOCUMENT_DATA from "../../config/document-data.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";
import SiblingDocumentField from "../fields/sibling-document-field.mjs";

const { isEmpty } = foundry.utils;

/**
 * Data model template with information on the questor path items.
 * @augments ClassTemplate
 * @mixes ItemDescriptionTemplate
 * @property {string} questorDevotionId   The ID of the associated devotion item.
 */
export default class QuestorData extends ClassTemplate.mixin(
  ItemDescriptionTemplate
) {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
      questorDevotionId: new SiblingDocumentField(
        foundry.documents.Item,
        {
          systemTypes: [ SYSTEM_TYPES.Item.devotion, ],
          nullable:    true,
        }
      ),
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Questor",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      hasLinkedItems:    true,
      type:              SYSTEM_TYPES.Item.questor,
    }, {
      inplace: false
    },
  ) );

  // endregion

  // region LP Tracking

  // region LP Learning

  /** @inheritDoc */
  get canBeLearned() {
    return true;
  }

  /** @inheritDoc */
  static async learn( actor, item, createData = {} ) {
    if ( isEmpty ( actor.itemTypes.discipline ) ) {
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.firstClassViaCharGen" ) );
    }

    // get the questor devotion
    const edidQuestorDevotion = game.settings.get( "ed4e", "edidQuestorDevotion" );
    let questorDevotion = actor.items.get( item.system.questorDevotionId );
    questorDevotion ??= await getSingleGlobalItemByEdid( edidQuestorDevotion, SYSTEM_TYPES.Item.devotion );
    questorDevotion ??= await Item.create( DOCUMENT_DATA.documentData.Item.devotion.questor );

    // "Do you want to become a questor of <passion>? This will grant you the following devotion automatically:"
    const questorDevotionLink = questorDevotion
      ? createContentLink( questorDevotion.uuid, questorDevotion.name )
      : game.i18n.format( "ED.Dialogs.Legend.questorDevotionNotFound", { edid: edidQuestorDevotion } );
    const content = ` 
      <p>${game.i18n.format( "ED.Dialogs.Legend.learnQuestorPrompt", {passion: item.name,} ) }</p>
      <p>${ questorDevotionLink }</p>
      `;

    const learn = await DialogEd.confirm( {
      rejectClose: false,
      content:     await foundry.applications.ux.TextEditor.enrichHTML( content ),
    } );

    if ( !learn ) return;

    const questorDevotionData = questorDevotion?.toObject();
    questorDevotionData.name = `${questorDevotion.name} - ${item.name}`;
    questorDevotionData.system.level = 1;
    questorDevotionData.system.edid = edidQuestorDevotion;
    const learnedDevotion = ( await actor.createEmbeddedDocuments( "Item", [ questorDevotionData ] ) )?.[0];

    const questorCreateData = foundry.utils.mergeObject(
      createData,
      {
        "system.level":             1,
        "system.questorDevotionId": learnedDevotion?.id,
      }
    );

    const learnedQuestor = await super.learn( actor, item, questorCreateData );
    if ( !learnedDevotion || !learnedQuestor ) throw new Error(
      "Error learning questor item. Could not create embedded Items."
    );

    return learnedQuestor;
  }

  // endregion

  // region LP Increase

  /** @inheritDoc */
  get increaseRules() {
    return game.i18n.localize( "ED.Dialogs.Legend.Rules.questorClassIncreaseShortRequirements" );
  }

  /** @inheritDoc */
  get increaseValidationData() {
    if ( !this.isActorEmbedded ) return undefined;

    return {};
  }

  /** @inheritDoc */
  get requiredLpForIncrease() {
    // Questor devotion is treated as a journeyman talent
    return LEGEND.legendPointsCost[ this.unmodifiedLevel + 1 + LEGEND.lpIndexModForTier[1].journeyman ];
  }

  /** @inheritDoc */
  async increase() {
    if ( !this.isActorEmbedded ) return;

    const nextLevel = this.unmodifiedLevel + 1;
    const updatedQuestor = await super.increase();
    if ( updatedQuestor?.system.level !== nextLevel ) {
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.classIncreaseProblems" )
      );
      return;
    }

    const promptFactory = PromptFactory.fromDocument( this.parent );
    const spendLp = await promptFactory.getPrompt( "lpIncrease" );

    if ( !spendLp
      || spendLp === "cancel"
      || spendLp === "close" ) return;

    const updatedActor = await this.containingActor.addLpTransaction(
      "spendings",
      LpSpendingTransactionData.dataFromLevelItem(
        this.parent,
        spendLp === "spendLp" ? this.requiredLpForIncrease : 0,
        this.lpSpendingDescription,
      ),
    );

    if ( foundry.utils.isEmpty( updatedActor ) )
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.abilityIncreaseProblems" )
      );

    // possibly update the associated devotion
    const questorDevotion = this.containingActor.items.get( this.questorDevotionId );
    if ( !questorDevotion ) return this.parentDocument;

    const content =  `
        <p>
          ${game.i18n.format( "ED.Dialogs.Legend.increaseQuestorDevotionPrompt" )}
        </p>
        <p>
          ${createContentLink( questorDevotion.uuid, questorDevotion.name )}
        </p>
      `;
    const increaseDevotion = await DialogEd.confirm( {
      rejectClose: false,
      content:     await foundry.applications.ux.TextEditor.enrichHTML( content ),
    } );
    if ( increaseDevotion && !(
      await questorDevotion.update( { "system.level": nextLevel } )
    ) ) ui.notifications.warn( "ED.Notifications.Warn.questorItemNotUpdated" );

    return this.parentDocument;
  }

  // endregion

  // endregion

  // region Drag and Drop

  async _onDropDevotion( event, document ) {
    const questorItem = this.parentDocument;
    await questorItem.update( {
      "system.questorDevotionId": document.id,
    } );
    return true;
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