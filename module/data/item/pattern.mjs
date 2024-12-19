import { ItemDataModel } from "../abstract.mjs";
import { ItemDescriptionTemplate } from "./_module.mjs";

export default class PatternData extends ItemDataModel.mixin(
  ItemDescriptionTemplate
) {

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