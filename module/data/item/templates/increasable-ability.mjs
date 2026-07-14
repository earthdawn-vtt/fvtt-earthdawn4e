import LpIncreaseTemplate from "./lp-increase.mjs";
import PromptFactory from "../../../applications/global/prompt-factory.mjs";
import LpSpendingTransactionData from "../../advancement/lp-spending-transaction.mjs";
import AbilityTemplate from "./ability.mjs";

/**
 * @import { IncreasableAbilityTemplateData } from "./_types.mjs";
 */

/**
 * Data model template with information on abilities that have rank and therefore can be increased with LP.
 * @augments {AbilityTemplate<IncreasableAbilityTemplateData>}
 * @mixes LpIncreaseTemplate
 * @see {@link IncreasableAbilityTemplateData} The system data model for this template.
 */
export default class IncreasableAbilityTemplate extends AbilityTemplate.mixin(
  LpIncreaseTemplate,
) {

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.IncreasableAbility",
  ];

  // endregion

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      level: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
    } );
  }

  // endregion

  // region Getters

  get baseRollOptions() {
    const rollOptions = super.baseRollOptions;
    rollOptions.updateSource( {
      step:             {
        base:      this.rankFinal,
      },
    } );

    return rollOptions;
  }

  /** @inheritDoc */
  get rankFinal() {
    return super.rankFinal + this.level;
  }

  // endregion

  // region Rolling

  /** @inheritDoc */
  getRollData() {
    return {
      level: this.level,
      rank:  this.rankFinal,
    };
  }

  // endregion

  // region LP Tracking

  /**
   * @inheritDoc
   */
  async increase() {
    if ( !this.isActorEmbedded ) return;

    const promptFactory = PromptFactory.fromDocument( this.parent );

    if ( !this.tier ) {
      ui.notifications.error(
        _loc( "ED.Notifications.Error.abilityIncreaseNoTier" )
      );
      return;
    }

    const spendLp = await promptFactory.getPrompt( "lpIncrease" );

    if ( !spendLp
      || spendLp === "cancel"
      || spendLp === "close" ) return;

    await this.parent.actor.addLpTransaction(
      "spendings",
      LpSpendingTransactionData.dataFromLevelItem(
        this.parent,
        spendLp === "spendLp" ? this.requiredLpForIncrease : 0,
        this.lpSpendingDescription,
      ),
    );

    return this.adjustLevel( 1 );
  }

  /** @inheritDoc */
  static async learn( actor, item, createData ) {
    const learnedItem = await super.learn( actor, item, createData );
    if ( !createData?.system?.level ) learnedItem.system.level = 0;
    return learnedItem;
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