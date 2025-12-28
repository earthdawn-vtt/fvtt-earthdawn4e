import FormulaField from "../fields/formula-field.mjs";
import SparseDataModel from "../abstract/sparse-data-model.mjs";

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
      key:      new fields.StringField(),
      value:    new FormulaField( {
        required: false,
        blank:    true,
      } ),
      mode:     new fields.NumberField( {
        initial: CONST.ACTIVE_EFFECT_MODES.ADD,
      } ),
      priority: new fields.NumberField(),
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