import ED4E from "../../config/_module.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ItemDataModel from "../abstract/item-data-model.mjs";

/**
 * Data model template with information on Poison and Disease items.
 * @property {object} effect                      effect type
 * @property {number} effect.damageStep           damage step
 * @property {number} effect.paralysisStep        paralysis step
 * @property {number} effect.debilitationStep     debilitation step
 * @property {object} interval                    interval 
 * @property {number} interval.totalEffects       total number of effects
 * @property {number} interval.timeInBetween      time between effects
 * @property {number} onsetTime                   after which time will the poison become effective
 * @property {number} duration                    duration
 * @property {string} activation            how the poison will be activated
 * @property {boolean} death                deadly poison
 */
export default class PoisonDiseaseData extends ItemDataModel.mixin(
  ItemDescriptionTemplate
)  {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.PoisonDisease",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      effect: new fields.SchemaField( {
        damageStep: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,   
          integer:  true,
        } ), 
        paralysisStep: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ), 
        debilitationStep: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ), 
      } ),
      interval: new fields.SchemaField( {
        totalEffects: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ), 
        timeInBetween: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ), 
      } ),
      onsetTime: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ), 
      duration: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ), 
      activation: new fields.StringField( {
        required: true,
        blank:    false,
        initial:  "wound",
        choices:  ED4E.PoisonActivation,
      } ),
      death: new fields.BooleanField( {
        required: true,
        initial:  false,
      } ),
            
    } );
  }
}