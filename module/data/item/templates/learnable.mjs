import SystemDataModel from "../../abstract.mjs";

/**
 * Template to be mixed in with data models that can be acquired through legend points (like abilities and spells).
 * @property {boolean} canBeLearned Whether the item fulfills all requirements to be learned.
 * @mixin
 */
export default class LearnableTemplate extends SystemDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Learnable",
  ];

  /**
   * @description Whether the entity fulfills all requirements to be learned.
   * @type {boolean}
   * @abstract
   */
  get canBeLearned() {
    throw new Error( "A subclass of the LearnableTemplate must implement the canBeLearned getter." );
  }

  /**
   * @description Whether the entity can be learned. Should always be true if mixed in, as a shortcut for checking
   * if this is mixed in.
   * @type {boolean}
   */
  get learnable() {
    return true;
  }

  /**
   * @description Data needed to validate if this entity can be learned.
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
    return game.i18n.localize(
      "ED.Actor.LpTracking.Spendings.learningTransactionDescription",
    );
  }

  /**
   * @description The amount of legend points required to learn this entity.
   * @type {number}
   */
  get requiredLpToLearn() {
    throw new Error( "A subclass of the LearnableTemplate must implement the 'requiredLpToLearn' getter." );
  }

  /**
   * Learn the entity by an actor. This means creating a new item instance onn the actor, either without spending LP on
   * level 0 for items with a level, or by spending LP.
   * @param {ActorEd} actor                 The actor that is learning the entity.
   * @param {ItemEd} item                   The item that is being learned.
   * @param {object} createData             Additional data to create the item with. Keys can be in the period separated format.
   * @returns {Promise<ItemEd>|undefined}   The created Item instance if learned, or undefined if the entity was not learned.
   * @abstract
   */
  static async learn( actor, item, createData = {} ) {
    throw new Error( "A subclass of the LearnableTemplate must implement the 'learn' method." );
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