import EarthdawnActiveEffectData from "./eae.mjs";

const { NumberField, StringField } = foundry.data.fields;

/**
 * System data for 'Conditions'.
 * These are created from statuses with option support for levels of severity. Can apply to an actor or item.
 * @property {string} primary     The primary status of this condition.
 * @property {number} level       The level of this condition.
 */
export default class EarthdawnConditionEffectData extends EarthdawnActiveEffectData {

  static metadata = Object.freeze(
    foundry.utils.mergeObject( super.metadata, {
      type: "condition",
    } , {
      inplace: false
    } ),
  );

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject( super.defineSchema(), {
      primary: new StringField( {
        required: true,
        blank:    false,
      } ),
      level: new NumberField( {
        nullable: true,
        initial:  null,
        integer:  true,
      } ),
    } );
  }

  // region Data Preparation


  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.parent.transfer = false;
    this.parent.statuses.add( this.primary );
    this.maxLevel = CONFIG.ED4E.STATUS_CONDITIONS[ this.primary ]?.levels || null;
    if ( !this.maxLevel || ( this.level > this.maxLevel ) ) this.level = this.maxLevel;
  }

  // endregion

  // region Levels

  /**
   * Increase the level of a status that can either be stacked or has discrete stages.
   * @param {number} [levels]   Amount of levels to increase by. Defaults to 1.
   * @returns {Promise<EarthdawnActiveEffect|undefined>} The updated effect or undefined if the level could not be increased.
   */
  async increase( levels = 1 ) {
    const maxLevel = this.maxLevel ?? CONFIG.ED4E.STATUS_CONDITIONS[ this.primary ]?.levels;
    if ( !maxLevel || !( maxLevel > 1 ) || ( this.level === maxLevel ) ) return;

    const disabled = this.parent?.isDisabled;
    const diff = Math.min( maxLevel, this.level + levels ) - this.level;
    return this.parent.update( {
      "system.level": Math.min( maxLevel, this.level + levels ),
      disabled:       false,
    }, {
      statusLevelDifference: disabled ? undefined : diff
    } );
  }

  /**
   * Decrease the level of a status that can either be stacked or has discrete stages.
   * It is the responsibility of the caller to delete the status if it would go below level 1.
   * @returns {Promise<EarthdawnActiveEffect|undefined>} The updated effect or undefined if the level could not be decreased.
   */
  async decrease() {
    const disabled = this.parent?.isDisabled;
    const diff = ( this.level - 1 ) - this.level;
    return this.parent.update( {
      "system.level": this.level - 1,
      disabled:       false,
    }, {
      statusLevelDifference: disabled ? undefined : diff
    } );
  }

  // endregion
}