import { SparseDataModel } from "../abstract.mjs";
import ThreadLevelData from "./thread-level.mjs";

export default class ThreadBaseData extends SparseDataModel {
  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      levels: new fields.ArrayField(
        new fields.EmbeddedDataField(
          ThreadLevelData,
          {
            required: false,
            nullable: true,
            label:    "ED.threadLevel",
            hint:     "ED.threadLevel"
          }
        ),
        {
          required: true,
          nullable: true,
          initial:  [],
        } ),
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
