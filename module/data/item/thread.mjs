import ItemDataModel from "../abstract/item-data-model.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import LpIncreaseTemplate from "./templates/lp-increase.mjs";
import ED4E, { MAGIC } from "../../config/_module.mjs";
import PromptFactory from "../../applications/global/prompt-factory.mjs";
import LpSpendingTransactionData from "../advancement/lp-spending-transaction.mjs";

/**
 * Data model for thread items.
 * @property {string|null} wovenToUuid The UUID of the item this thread is woven to, if any.
 * @property {number} level The rank of this thread.
 * @mixes ItemDescriptionTemplate
 * @mixes LpIncreaseTemplate
 */
export default class ThreadData extends ItemDataModel.mixin(
  ItemDescriptionTemplate,
  LpIncreaseTemplate,
) {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      wovenToUuid: new fields.DocumentUUIDField( {} ),
      level:       new fields.NumberField( {
        required: true,
        nullable: false,
        step:     1,
        integer:  true,
        min:      0,
        initial:  0,
      } ),
      threadType:  new fields.StringField( {
        required:  true,
        nullable:  true,
        empty:     false,
        initial:   null,
        choices:   MAGIC.threadTypes,
      } ),
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.Thread",
  ];

  // endregion

  // region Life Cycle Events

  /** @inheritDoc */
  async _preCreate( data, options, user ) {
    if ( await super._preCreate( data, options, user ) === false ) return false;

    const updates = {};
    if ( !data.system?.threadType && !data[ "system.threadType" ] ) {
      updates.system ??= {};
      updates.threadType = await this._determineThreadType();
    }

    this.updateSource( updates );
  }

  /** @inheritDoc */
  async _preUpdate( changes, options, user ) {
    if ( await super._preUpdate( changes, options, user ) === false ) return false;

    const wovenToUuid = changes.system?.wovenToUuid ?? changes[ "system.wovenToUuid" ];
    if ( wovenToUuid ) {
      changes.system ??= {};
      changes.system.threadType = await this._determineThreadType(
        changes.system?.wovenToUuid ?? changes[ "system.wovenToUuid" ]
      );
    }
  }

  /** @inheritDoc */
  _onDelete( options, user ) {
    this.getConnectedDocument().then(
      connectedDocument =>
        connectedDocument
          ? connectedDocument.system.truePattern.removeAttachedThread( this.parentDocument.uuid  )
          : null,
    );
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

  // region LP Tracking

  /** @inheritdoc */
  get canBeIncreased() {
    return this.isActorEmbedded
      && Object.values(
        this.increaseValidationData
      ).every( Boolean );
  }

  /** @inheritdoc */
  get increaseData() {
    if ( !this.isActorEmbedded ) return undefined;
    const actor = this.containingActor;

    return {
      newLevel:   this.unmodifiedLevel + 1,
      requiredLp: this.requiredLpForIncrease,
      hasDamage:  actor.hasDamage( "standard" ),
      hasWounds:  actor.hasWounds( "standard" ),
    };
  }

  /** @inheritdoc */
  get increaseRules() {
    return game.i18n.localize( "ED.Dialogs.Legend.Rules.threadItemIncreaseShortRequirements" );
  }

  /** @inheritdoc */
  get increaseValidationData() {
    if ( !this.isActorEmbedded ) return undefined;
    const increaseData = this.increaseData;
    return {
      [ED4E.validationCategories.resources]: [
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

  /** @inheritdoc */
  get lpSpendingDescription() {
    return this.unmodifiedLevel <= 0
      ?  game.i18n.format(
        "ED.Actor.LpTracking.Spendings.newThread",
        { threadTarget: fromUuidSync( this.wovenToUuid ).name },
      )
      : super.lpSpendingDescription;
  }

  /** @inheritdoc */
  get requiredLpForIncrease() {
    const connectedDocument = fromUuidSync( this.wovenToUuid );
    if ( !connectedDocument.system?.truePattern ) return undefined;

    const newLevel = this.unmodifiedLevel + 1;
    if ( newLevel <= 0 ) return 0;
    return connectedDocument.system.truePattern.getRequiredLpForLevelSync( newLevel );
  }

  /** @inheritdoc */
  get requiredMoneyForIncrease() {
    return 0;
  }

  /** @inheritdoc */
  async getRequiredLpForLevel( level ) {
    const connectedDocument = await this.getConnectedDocument();
    if ( !connectedDocument ) return undefined;

    const newLevel = level ?? this.unmodifiedLevel + 1;
    if ( newLevel <= 0 ) return 0;
    return connectedDocument.system.truePattern.getRequiredLpForLevel( newLevel );
  }

  /** @inheritdoc */
  async increase() {
    const actor = this.containingActor;
    if ( !actor ) throw new Error( "Cannot increase thread level of a thread not embedded in an actor." );

    const connectedDocument = await this.getConnectedDocument();
    if ( !connectedDocument ) throw new Error( "Cannot increase thread level of a thread not woven to any document." );

    const spendLp = await PromptFactory.fromDocument( this.parentDocument ).getPrompt( "lpIncrease" );
    if ( !spendLp
      || spendLp === "cancel"
      || spendLp === "close" ) return;

    const newLevel = this.unmodifiedLevel + 1;
    const requiredLp = await this.getRequiredLpForLevel( newLevel );

    const updatedThread = await this.parentDocument.update( {
      "system.level": newLevel,
    } );
    if ( foundry.utils.isEmpty( updatedThread ) ) {
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.abilityIncreaseProblems" )
      );
      return;
    }

    const updatedActor = await actor.addLpTransaction(
      "spendings",
      LpSpendingTransactionData.dataFromLevelItem(
        this.parentDocument,
        spendLp === "spendLp" ? requiredLp : 0,
        this.lpSpendingDescription,
      ),
    );

    if ( foundry.utils.isEmpty( updatedActor ) )
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.abilityIncreaseProblems" )
      );

    return this.parentDocument;
  }

  // endregion

  // region Methods

  /**
   * Get the document this thread is woven to, if any.
   * @returns {Promise<Document|null>} The document this thread is woven to, or null if not woven to any document.
   */
  async getConnectedDocument() {
    return fromUuid( this.wovenToUuid );
  }

  /**
   * Determine the type of thread this is based on the document it is woven to.
   * This is automatically determined on creation and update of the thread item and stored in the
   * `threadType` field.
   * @param {string} [wovenToUuid] The UUID of the document this thread is woven to. If not provided, the current
   * value of `this.wovenToUuid` will be used.
   * @returns {Promise<string|null>} The type of thread, as defined in {@link MAGIC.threadTypes}, or null if it
   * cannot be determined.
   */
  async _determineThreadType( wovenToUuid ) {
    const connectedDocument = wovenToUuid ? await fromUuid( wovenToUuid ) : await this.getConnectedDocument();
    return connectedDocument?.system?.truePattern.truePatternType ?? null;
  }

  /**
   * Add an active effect to the thread or create a new one. There can always ever be only one active effect on
   * a thread.
   * @param {EarthdawnActiveEffect|object} [effect] The active effect to add
   * or the data for creating a new one.
   * @param {object} [options] Options for adding the active effect.
   * @param {boolean} [options.overwrite] Whether to overwrite an existing active effect.
   * @returns {Promise<EarthdawnActiveEffect|undefined>} The created active effect or undefined if no effect was added.
   */
  async addActiveEffect( effect = {}, options = { overwrite: false, } ) {
    const parentDocument = /** @type {ItemEd} */ this.parentDocument;
    if ( !parentDocument ) throw new Error( "Cannot add an active effect to a thread without parent document." );

    const existingEffect = parentDocument.effects[0];
    if ( existingEffect && !options.overwrite ) return;
    if ( existingEffect && options.overwrite ) await existingEffect.delete();

    const createdDocuments = await parentDocument.createEmbeddedDocuments(
      "ActiveEffect",
      [ effect.toObject?.() ?? effect, ],
    );
    return /** @type {EarthdawnActiveEffect|undefined} */ createdDocuments[0];
  }

  /**
   * Delete the active effect on this thread, if any.
   * @returns {Promise<EarthdawnActiveEffect|undefined>} The deleted active effect or undefined if no
   * effect was deleted.
   */
  async deleteActiveEffect() {
    const parentDocument = /** @type {ItemEd} */ this.parentDocument;
    if ( !parentDocument ) throw new Error( "Cannot delete an active effect from a thread without parent document." );

    const existingEffect = parentDocument.effects[0];
    if ( !existingEffect ) return;

    return existingEffect.delete();
  }

  // endregion

}