import { SparseDataModel } from "../abstract.mjs";
import IdentifierField from "../fields/identifier-field.mjs";

export default class ThreadLevelData extends SparseDataModel {
  /** @inheritDoc */
  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      identifier: new IdentifierField( {
        required: true,
        nullable: false,
        // label:    this.labelKey( "PhysicalItems.ThreadItem.identifier" ),
        // hint:     this.hintKey( "PhysicalItems.ThreadItem.identifier" )
        label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.identifier",
        hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.identifier"
      } ),
      level: new fields.NumberField( {
        required: true,
        nullable: false,
        step:     1,
        positive: true,
        initial:  1,
        // label:    this.labelKey( "PhysicalItems.ThreadItem.level" ),
        // hint:     this.hintKey( "PhysicalItems.ThreadItem.level" )
        label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.level",
        hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.level"
      } ),
      isAnalysed: new fields.BooleanField( {
        required: true,
        nullable: false,
        initial:  false,
        // label:    this.labelKey( "PhysicalItems.ThreadItem.isAnalysed" ),
        // hint:     this.hintKey( "PhysicalItems.ThreadItem.isAnalysed" )
        label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.isAnalysed",
        hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.isAnalysed"
      } ),
      isActive: new fields.BooleanField( {
        required: true,
        nullable: false,
        initial:  false,
        // label:    this.labelKey( "PhysicalItems.ThreadItem.isActive" ),
        // hint:     this.hintKey( "PhysicalItems.ThreadItem.isActive" )
        label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.isActive",
        hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.isActive"
      } ),
      keyKnowledge: new fields.SchemaField( {
        isRequired: new fields.BooleanField( {
          required: true,
          nullable: false,
          initial:  false,
          // label:    this.labelKey( "PhysicalItems.ThreadItem.KeyKnowledge.isRequired" ),
          // hint:     this.hintKey( "PhysicalItems.ThreadItem.KeyKnowledge.isRequired" )
          label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.KeyKnowledge.isRequired",
          hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.KeyKnowledge.isRequired"
        } ),
        question: new fields.StringField( {
          required: true,
          nullable: false,
          initial:  "",
          // label:    this.labelKey( "PhysicalItems.ThreadItem.KeyKnowledge.question" ),
          // hint:     this.hintKey( "PhysicalItems.ThreadItem.KeyKnowledge.question" )
          label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.KeyKnowledge.question",
          hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.KeyKnowledge.question"
        } ),
        answer: new fields.StringField( {
          required: true,
          nullable: false,
          initial:  "",
          // label:    this.labelKey( "PhysicalItems.ThreadItem.KeyKnowledge.answer" ),
          // hint:     this.hintKey( "PhysicalItems.ThreadItem.KeyKnowledge.answer" )
          label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.KeyKnowledge.answer",
          hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.KeyKnowledge.answer"
        } ),
        isknown: new fields.BooleanField( {
          required: true,
          nullable: false,
          initial:  false,
          // label:    this.labelKey( "PhysicalItems.ThreadItem.KeyKnowledge.isknown" ),
          // hint:     this.hintKey( "PhysicalItems.ThreadItem.KeyKnowledge.isknown" )
          label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.KeyKnowledge.isknown",
          hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.KeyKnowledge.isknown"
        } )
      } ),
      deed: new fields.SchemaField( {
        isRequired: new fields.BooleanField( {
          required: true,
          nullable: false,
          initial:  false,
          // label:    this.labelKey( "PhysicalItems.ThreadItem.Deed.isRequired" ),
          // hint:     this.hintKey( "PhysicalItems.ThreadItem.Deed.isRequired" )
          label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.Deed.isRequired",
          hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.Deed.isRequired"
        } ),
        description: new fields.StringField( {
          required: true,
          nullable: false,
          initial:  "",
          // label:    this.labelKey( "PhysicalItems.ThreadItem.Deed.description" ),
          // hint:     this.hintKey( "PhysicalItems.ThreadItem.Deed.description" )
          label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.Deed.description",
          hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.Deed.description"
        } ),
        isCompleted: new fields.BooleanField( {
          required: true,
          nullable: false,
          initial:  false,
          // label:    this.labelKey( "PhysicalItems.ThreadItem.Deed.isCompleted" ),
          // hint:     this.hintKey( "PhysicalItems.ThreadItem.Deed.isCompleted" )
          label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.Deed.isCompleted",
          hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.Deed.isCompleted"
        } )
      } ),
      effect: new fields.StringField( {
        required: true,
        nullable: false,
        initial:  "",
        // label:    this.labelKey( "PhysicalItems.ThreadItem.effect" ),
        // hint:     this.hintKey( "PhysicalItems.ThreadItem.effect" )
        label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.effect",
        hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.effect"
      } ),
      activeEffect: new fields.SetField(
        new fields.DocumentUUIDField(
          ActiveEffect,
          {
            // label:    this.labelKey( "PhysicalItems.ThreadItem.activeEffect" ),
            // hint:     this.hintKey( "PhysicalItems.ThreadItem.activeEffect" )
            label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.activeEffect",
            hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.activeEffect"
          }
        ),
        {
          required: true,
          empty:    true,
          initial:  [],
          // label:    this.labelKey( "PhysicalItems.ThreadItem.activeEffect" ),
          // hint:     this.hintKey( "PhysicalItems.ThreadItem.activeEffect" )
          label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.activeEffect",
          hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.activeEffect"
        }
      ),
    };
  }


  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    super.migrateData( source );
    // specific migration functions
  }
}