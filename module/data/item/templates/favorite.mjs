import SystemDataModel from "../../abstract/system-data-model.mjs";

/**
 * Data model template with item description
 * @mixin
 */
export default class FavoriteTemplate extends SystemDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Favorite",
  ];

  /** @inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      favorite: new fields.BooleanField( {
        required: true,
        initial:  false,
      } )
    };
  }
}