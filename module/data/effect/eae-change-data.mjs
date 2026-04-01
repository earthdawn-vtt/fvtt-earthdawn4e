import ActiveEffectDataModel from "../abstract/active-effect-data-model.mjs";
import SparseDataModel from "../abstract/sparse-data-model.mjs";

export default class EarthdawnActiveEffectChangeData extends SparseDataModel {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      key:      new fields.StringField( {
        required: true,
      }, ),
      type:     new fields.StringField( {
        required: true,
        blank:    false,
        initial:  "add",
        validate: ActiveEffectDataModel._validateChangeType,
      }, ),
      value:    new fields.AnyField( {
        required:     true,
        nullable:     true,
        serializable: true,
        initial:      "",
      } ),
      phase:    new fields.StringField( {
        required: true,
        blank:    false,
        initial:  "initial",
      } ),
      priority: new fields.NumberField(),
    };
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.ActiveEffect.Change",
  ];

  // endregion

  // region Static Methods

  /**
   * Get a {@link EarthdawnActiveEffectChangeData} that sets the given key to 0.
   * @param {string} key The fieldPath for the property to set to 0.
   * @returns {EarthdawnActiveEffectChangeData} The change data.
   */
  static _getZeroChange( key ) {
    return {
      key:   key,
      value: 0,
      mode:  "override",
    };
  }

  // endregion

}