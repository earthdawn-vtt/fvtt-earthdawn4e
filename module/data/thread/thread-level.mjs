import { SparseDataModel } from "../abstract.mjs";

export default class ThreadLevelData extends SparseDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.ThreadLevel",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
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
      isAnalyzed: new fields.BooleanField( {
        required: true,
        nullable: false,
        initial:  false,
        // label:    this.labelKey( "PhysicalItems.ThreadItem.isLevelAnalyzed" ),
        // hint:     this.hintKey( "PhysicalItems.ThreadItem.isLevelAnalyzed" )
        label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.isLevelAnalyzed",
        hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.isLevelAnalyzed"
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
        isKnown: new fields.BooleanField( {
          required: true,
          nullable: false,
          initial:  false,
          // label:    this.labelKey( "PhysicalItems.ThreadItem.KeyKnowledge.isKnown" ),
          // hint:     this.hintKey( "PhysicalItems.ThreadItem.KeyKnowledge.isKnown" )
          label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.KeyKnowledge.isKnown",
          hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.KeyKnowledge.isKnown"
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