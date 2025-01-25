import { SparseDataModel } from "../abstract.mjs";
import FormulaField from "../fields/formula-field.mjs";

/**
 * @implements {EffectDurationData}
 */
export default class EarthdawnActiveEffectDurationData extends SparseDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      startTime: new fields.NumberField( {
        label: this.labelKey( "EAEDurationData.startTime" ),
        hint:  this.hintKey( "EAEDurationData.startTime" ),
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
    };
  }

}