import ItemDataModel from "../abstract/item-data-model.mjs";

export default class ThreadData extends ItemDataModel {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    // const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
    };
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.Thread",
  ];

  // endregion

}