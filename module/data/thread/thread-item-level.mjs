import SparseDataModel from "../abstract/sparse-data-model.mjs";

export default class ThreadItemLevelData extends SparseDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.ThreadItemLevel",
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
      keyKnowledge: new fields.SchemaField( {
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
      deed: new fields.StringField( {
        required: true,
        nullable: false,
        initial:  "",
      } ),
      effect: new fields.StringField( {
        required: true,
        nullable: false,
        initial:  "",
      } ),
      activeEffects: new fields.SetField(
        new fields.DocumentUUIDField( {
          type:     "ActiveEffect",
        } ),
        {
          required: true,
          initial:  [],
        },
      ),
      abilities: new fields.SetField(
        new fields.DocumentUUIDField( {
          type:     "Item",
        } ),
        {
          required: true,
          initial:  [],
        },
      ),
    };
  }

}