import SystemDataModel from "../../abstract/system-data-model.mjs";

/**
 * Template to be mixed in with data models that have a level that can be increased through spending legend points.
 * @property {boolean} canBeIncreased Whether the entity fulfills all requirements to be increased.
 * @property {object} increaseValidationDataForIncrease Data needed to validate the increase of this entity's level.
 * @property {number} requiredLpForIncrease The amount of legend points required to increase the level of the entity.
 * @mixin
 */
export default class LpIncreaseTemplate extends SystemDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.LpIncrease",
  ];

  /**
   * @description Whether the entity fulfills all requirements to be increased.
   * @type {boolean}
   */
  get canBeIncreased() {
    throw new Error( "A subclass of the LpIncreaseTemplate must implement the canBeIncreased getter." );
  }

  /**
   * @description Whether the entity can be increased. This is a shortcut for checking if this is mixed in.
   * @type {boolean}
   */
  get increasable() {
    return true;
  }

  /**
   * @description Data needed to validate the increase of this entity's level.
   * @type {object}
   */
  get increaseData() {
    throw new Error( "A subclass of the LpIncreaseTemplate must implement the increaseValidationDataForIncrease getter." );
  }

  /**
   * A string representation of the rules, conditions and costs for increasing the level of the entity.
   * @type {string}
   */
  get increaseRules() {
    throw new Error( "A subclass of the LpIncreaseTemplate must implement the increaseRules getter." );
  }

  /**
   * The data needed to validate the increase of this entity's level. Each key is a validation rule with the value
   * indicating whether the rule is fulfilled. If any of the values is `false`, the increase should not be allowed.
   * @type {Record<string, boolean>}
   */
  get increaseValidationData() {
    throw new Error( "A subclass of the LpIncreaseTemplate must implement the validation getter." );
  }

  /**
   * A description of the transaction that is created when the entity is increased.
   * @type {string}
   */
  get lpSpendingDescription() {
    return game.i18n.format(
      "ED.Actor.LpTracking.Spendings.spendingTransactionDescription",
      {
        previousLevel: this.level,
        newLevel:      this.level + 1,
      },
    );
  }

  /**
   * @description The amount of legend points required to increase the level of the entity.
   * @type {number}
   */
  get requiredLpForIncrease() {
    throw new Error( "A subclass of the LpIncreaseTemplate must implement the requiredLpForIncrease getter." );
  }

  /**
   * @description The amount of silver required to increase the level of the entity.
   * @type {number}
   */
  get requiredMoneyForIncrease() {
    throw new Error( "A subclass of the LpIncreaseTemplate must implement the requiredMoneyForIncrease getter." );
  }

  /**
   * Increase the level of the entity by one, spend the required legend points and persist the transaction. Do
   * validation if settings are set to do so.
   * @returns {Promise<ItemEd|undefined>} The updated entity document.
   */
  async increase() {
    throw new Error( "A subclass of the LpIncreaseTemplate must implement the increase method." );
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