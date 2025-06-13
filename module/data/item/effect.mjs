import ItemDescriptionTemplate from "./templates/item-description.mjs";
import SystemDataModel from "../abstract/system-data-model.mjs";

/**
 * Data model template with information on items that are used to represent custom active effects.
 */
export default class EffectData extends SystemDataModel.mixin(
  ItemDescriptionTemplate
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Effect",
  ];

  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
            
    } );
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