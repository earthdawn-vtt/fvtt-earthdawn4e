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

  /**
   * Add a new level to this advancement.
   * @param {object} [data]    If provided, will initialize the new level with the given data.
   */
  addLevel( data = {} ) {
    this.parent.parent.update( {
      "system.threadData.levels": this.levels.concat(
        new ThreadLevelData(
          {
            ...data,
            level: this.levels.length + 1
          }
        )
      )
    } );
  }
  
  /**
   * Remove the last {@link amount} levels added from this advancement.
   * @param {number} [amount]   The number of levels to remove.
   */
  deleteLevel( amount = 1 ) {
    this.parent.parent.update( {
      "system.threadData.levels": this.levels.slice( 0, -( amount ?? 1 ) )
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
