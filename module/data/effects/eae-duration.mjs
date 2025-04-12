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
        label:    this.labelKey( "EAEDurationData.type" ),
        hint:     this.hintKey( "EAEDurationData.type" ),
      } ),
      startTime: new fields.NumberField( {
        initial: Date.now(),
        label:   this.labelKey( "EAEDurationData.startTime" ),
        hint:    this.hintKey( "EAEDurationData.startTime" ),
      } ),
      seconds: new FormulaField( {
        label: this.labelKey( "EAEDurationData.seconds" ),
        hint:  this.hintKey( "EAEDurationData.seconds" ),
      } ),
      combat: new fields.DocumentIdField( {
        label: this.labelKey( "EAEDurationData.combat" ),
        hint:  this.hintKey( "EAEDurationData.combat" ),
      } ),
      rounds: new FormulaField( {
        label: this.labelKey( "EAEDurationData.rounds" ),
        hint:  this.hintKey( "EAEDurationData.rounds" ),
      } ),
      turns: new FormulaField( {
        label: this.labelKey( "EAEDurationData.turns" ),
        hint:  this.hintKey( "EAEDurationData.turns" ),
      } ),
      startRound: new fields.NumberField( {
        label: this.labelKey( "EAEDurationData.startRound" ),
        hint:  this.hintKey( "EAEDurationData.startRound" ),
      } ),
      startTurn: new fields.NumberField( {
        label: this.labelKey( "EAEDurationData.startTurn" ),
        hint:  this.hintKey( "EAEDurationData.startTurn" ),
      } ),
      uses: new fields.NumberField( {
        integer:  true,
        positive: true,
        label:    this.labelKey( "EAEDurationData.uses" ),
        hint:     this.hintKey( "EAEDurationData.uses" ),
      } ),
    };
  }

}