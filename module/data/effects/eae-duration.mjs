import { SparseDataModel } from "../abstract.mjs";
import FormulaField from "../fields/formula-field.mjs";
import ED4E from "../../config/_module.mjs";

/**
 * @implements {EffectDurationData}
 */
export default class EarthdawnActiveEffectDurationData extends SparseDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.ActiveEffect.EaeDuration",
  ];

  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      type:      new fields.StringField( {
        required: true,
        choices:  ED4E.eaeDurationTypes,
        initial:  "combat",
      } ),
      startTime: new fields.NumberField( {
        initial: Date.now(),
      } ),
      seconds:    new FormulaField(),
      combat:     new fields.DocumentIdField(),
      rounds:     new FormulaField(),
      turns:      new FormulaField(),
      startRound: new fields.NumberField(),
      startTurn:  new fields.NumberField(),
      uses:       new fields.NumberField( {
        integer:  true,
        positive: true,
      } ),
    };
  }

}