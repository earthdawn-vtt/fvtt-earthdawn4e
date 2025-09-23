import SparseDataModel from "../abstract/sparse-data-model.mjs";

export default class ImportAppData extends SparseDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.ImportApp",
  ];

  /** @inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    const textCategories = [
      "TEXT",
    ];
    return {
      folder: new fields.SchemaField( {
        path: new fields.StringField(
          {
            nullable: true,
            blank:    false,
            initial:  null,
          },
        ),
        documentTypes: new fields.SetField(
          new fields.StringField( {
            choices:  Object.fromEntries( CONST.WORLD_DOCUMENT_TYPES.map( t => [ t, t ] ) )
          } )
        ),
      } ),
      actor:     new fields.SchemaField( {
        path: new fields.FilePathField(
          {
            base64:     false,
            categories: textCategories,
            virtual:    false,
            wildcard:   false,
          },
        ),
      } ),
      item:      new fields.SchemaField( {
        path: new fields.FilePathField(
          {
            base64:     false,
            categories: textCategories,
            virtual:    false,
            wildcard:   false,
          },
        ),
      } ),
    };
  }

}