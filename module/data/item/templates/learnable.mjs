import SystemDataModel from "../../abstract/system-data-model.mjs";

/**
 * @import { LearnableTemplateData } from "./_types.mjs";
 */

/**
 * Template to be mixed in with data models that can be acquired through legend points (like abilities and spells).
 * Adds no schema fields; provides `canBeLearned`, `learnData`, `learnRules`, and related getters and the static
 * {@link LearnableTemplate.learn} method.
 * @augments {SystemDataModel<LearnableTemplateData>}
 * @mixin
 * @see {@link LearnableTemplateData} The system data model for this template.
 */
export default class LearnableTemplate extends SystemDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Learnable",
  ];

  /**
   * Whether the entity fulfills all requirements to be learned.
   * @type {boolean}
   * @abstract
   */
  get canBeLearned() {
    throw new Error( "A subclass of the LearnableTemplate must implement the canBeLearned getter." );
  }

  /**
   * Whether the entity can be learned. Should always be true if mixed in, as a shortcut for checking
   * if this is mixed in.
   * @type {boolean}
   */
  get learnable() {
    return true;
  }

  /**
   * Data needed to validate if this entity can be learned.
   * @type {object}
   */
  get learnData() {
    throw new Error( "A subclass of the LearnableTemplate must implement the learnValidationData getter." );
  }

  /**
   * The data needed to validate if this entity can be learned. Each key is a validation rule with the value
   * indicating whether the rule is fulfilled. If any of the values is `false`, the learning process should not be allowed.
   * @type {Record<string, boolean>}
   */
  get learnValidationData() {
    throw new Error( "A subclass of the LearnableTemplate must implement the validation getter." );
  }

  /**
   * A string representation of the rules, conditions and costs for learning this entity.
   * @type {string}
   */
  get learnRules() {
    throw new Error( "A subclass of the LearnableTemplate must implement the learnRules getter." );
  }

  /**
   * A description of the transaction that is created when the entity is increased.
   * @type {string}
   */
  get lpLearningDescription() {
    return _loc(
      "ED.Actor.LpTracking.Spendings.learningTransactionDescription",
      {
        itemName: this.parent?.name || "",
        itemType: _loc( `TYPES.Item.${ this.parent?.type }` ) || "",
      }
    );
  }

  /**
   * The number of legend points required to learn this entity.
   * @type {number}
   */
  get requiredLpToLearn() {
    throw new Error( "A subclass of the LearnableTemplate must implement the 'requiredLpToLearn' getter." );
  }

  /**
   * Learn the entity by an actor. This means creating a new item instance on the actor, either without spending LP on
   * level 0 for items with a level, or by spending LP.
   * @param {ActorEd} actor                 The actor that is learning the entity.
   * @param {ItemEd} item                   The item that is being learned.
   * @param {object} createData             Additional data to create the item with. Keys can be in the period separated format.
   * @returns {Promise<ItemEd>|undefined}   The created Item instance if learned, or undefined if the entity was not learned.
   */
  static async learn( actor, item, createData = {} ) {
    if ( !item.system.canBeLearned ) {
      ui.notifications.warn(
        _loc( "ED.Notifications.Warn.cannotLearn", {itemType: item.type} )
      );
      return;
    }
    const itemData = foundry.utils.mergeObject(
      item.toObject(),
      foundry.utils.expandObject( createData ),
    );
    return ( await actor.createEmbeddedDocuments( "Item", [ itemData ] ) )?.[0];
  }

}