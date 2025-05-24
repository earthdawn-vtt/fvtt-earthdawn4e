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
      } ),
      isAnalyzed: new fields.BooleanField( {
        required: true,
        nullable: false,
        initial:  false,
      } ),
      isActive: new fields.BooleanField( {
        required: true,
        nullable: false,
        initial:  false,
      } ),
      keyKnowledge: new fields.SchemaField( {
        isRequired: new fields.BooleanField( {
          required: true,
          nullable: false,
          initial:  false,
        } ),
        question: new fields.StringField( {
          required: true,
          nullable: false,
          initial:  "",
        } ),
        answer: new fields.StringField( {
          required: true,
          nullable: false,
          initial:  "",
        } ),
        isKnown: new fields.BooleanField( {
          required: true,
          nullable: false,
          initial:  false,
        } )
      } ),
      deed: new fields.SchemaField( {
        isRequired: new fields.BooleanField( {
          required: true,
          nullable: false,
          initial:  false,
        } ),
        description: new fields.StringField( {
          required: true,
          nullable: false,
          initial:  "",
        } ),
        isCompleted: new fields.BooleanField( {
          required: true,
          nullable: false,
          initial:  false,
        } )
      } ),
      effect: new fields.StringField( {
        required: true,
        nullable: false,
        initial:  "",
      } ),
      activeEffect: new fields.SetField(
        new fields.DocumentUUIDField(
          ActiveEffect ),
        {
          required: true,
          empty:    true,
          initial:  [],
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