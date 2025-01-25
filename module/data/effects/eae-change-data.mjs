import { SparseDataModel } from "../abstract.mjs";
import FormulaField from "../fields/formula-field.mjs";

/**
 * @implements {EffectChangeData}
 */
export default class EarthdawnActiveEffectChangeData extends SparseDataModel {

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      key:      new fields.StringField( {
        label: this.labelKey( "EAEChangeData.key" ),
        hint:  this.hintKey( "EAEChangeData.key" ),
      } ),
      value:    new FormulaField( {
        label:  this.labelKey( "EAEChangeData.value" ),
        hint:   this.hintKey( "EAEChangeData.value" ),
      } ),
      mode:     new fields.NumberField( {
        label:  this.labelKey( "EAEChangeData.mode" ),
        hint:   this.hintKey( "EAEChangeData.mode" ),
      } ),
      priority: new fields.NumberField( {
        label: this.labelKey( "EAEChangeData.priority" ),
        hint:  this.hintKey( "EAEChangeData.priority" ),
      } ),
      abilityUuid: new fields.DocumentUUIDField( {
        label: this.labelKey( "EAEChangeData.abilityUuid" ),
        hint:  this.hintKey( "EAEChangeData.abilityUuid" ),
      } )
    };
  }

}