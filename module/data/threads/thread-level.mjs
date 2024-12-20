import { SparseDataModel } from "../abstract.mjs";
import IdentifierField from "../fields/identifier-field.mjs";

export default class PatternThreadLevelData extends SparseDataModel {
  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      identifier: new IdentifierField( {
        required: true,
        nullable: false,
        label:    "ED.identifier",
        hint:     "ED.data.hints.ClearIdentifierForThis"
      } ),
      level: new fields.NumberField( {
        required: true,
        nullable: false,
        step:     1,
        positive: true,
        initial:  1,
        label:    "ED.level",
        hint:     "ED.TheLevelThisAdvancementDescribes"
      } ),
      effects: new fields.SetField(
        new fields.DocumentUUIDField(
          ActiveEffect,
          {
            label: "ED.ActiveEffect",
            hint:  "ED.AnActiveEffectGrantedOnThisLevel"
          }
        ),
        {
          required: true,
          empty:    true,
          initial:  [],
          label:    "ED.advancement.levelActiveEffects",
          hint:     "ED.TheSetOfActiveAbilitiesGrantedOnThisLevel"
        }
      ),
      isAnalysed: new fields.BooleanField( {
        required: true,
        nullable: false,
        initial:  false,
        label:    "ED.analysed",
        hint:     "ED.analysed"
      } ),
      isActive: new fields.BooleanField( {
        required: true,
        nullable: false,
        initial:  false,
        label:    "ED.active",
        hint:     "ED.active"
      } ),
      keyKnowledge: new fields.SchemaField( {
        isRequired: new fields.BooleanField( {
          required: true,
          nullable: false,
          initial:  false,
          label:    "ED.required",
          hint:     "ED.required"
        } ),
        question: new fields.StringField( {
          required: true,
          nullable: false,
          initial:  "",
          label:    "ED.question",
          hint:     "ED.question"
        } ),
        answer: new fields.StringField( {
          required: true,
          nullable: false,
          initial:  "",
          label:    "ED.answer",
          hint:     "ED.answer"
        } ),
        isknown: new fields.BooleanField( {
          required: true,
          nullable: false,
          initial:  false,
          label:    "ED.known",
          hint:     "ED.known"
        } )
      } ),
      deed: new fields.SchemaField( {
        isRequired: new fields.BooleanField( {
          required: true,
          nullable: false,
          initial:  false,
          label:    "ED.required",
          hint:     "ED.required"
        } ),
        description: new fields.StringField( {
          required: true,
          nullable: false,
          initial:  "",
          label:    "ED.description",
          hint:     "ED.description"
        } ),
        isCompleted: new fields.BooleanField( {
          required: true,
          nullable: false,
          initial:  false,
          label:    "ED.completed",
          hint:     "ED.completed"
        } )
      } ),
      effect: new fields.StringField( {
        required: true,
        nullable: false,
        initial:  "",
        label:    "ED.effect",
        hint:     "ED.effect"
      } ),
    };
  }
} 