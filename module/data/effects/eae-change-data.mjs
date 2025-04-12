import { SparseDataModel } from "../abstract.mjs";
import FormulaField from "../fields/formula-field.mjs";

/**
 * @implements {EffectChangeData}
 */
export default class EarthdawnActiveEffectChangeData extends SparseDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.ActiveEffect.Change",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      key:      new fields.StringField( {
        label: this.labelKey( "EAEChangeData.key" ),
        hint:  this.hintKey( "EAEChangeData.key" ),
      } ),
      value:    new FormulaField( {
        required: false,
        blank:    true,
        label:    this.labelKey( "EAEChangeData.value" ),
        hint:     this.hintKey( "EAEChangeData.value" ),
      } ),
      mode:     new fields.NumberField( {
        initial: CONST.ACTIVE_EFFECT_MODES.ADD,
        label:   this.labelKey( "EAEChangeData.mode" ),
        hint:    this.hintKey( "EAEChangeData.mode" ),
      } ),
      priority: new fields.NumberField( {
        label: this.labelKey( "EAEChangeData.priority" ),
        hint:  this.hintKey( "EAEChangeData.priority" ),
      } ),
    };
  }

  /**
   * Get a {@link EarthdawnActiveEffectChangeData} that sets the given key to 0.
   * @param {string} key The fieldPath for the property to set to 0.
   * @returns {EarthdawnActiveEffectChangeData} The change data.
   */
  static _getZeroChange( key ) {
    return {
      key:   key,
      value: 0,
      mode:  CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
    };
  }

}