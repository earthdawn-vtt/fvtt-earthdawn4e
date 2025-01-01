import { SparseDataModel } from "../abstract.mjs";
import IdentifierField from "../fields/identifier-field.mjs";

export default class ThreadLevelData extends SparseDataModel {
  /** @inheritDoc */
  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      identifier: new IdentifierField( {
        required: true,
        nullable: false,
        label:    "ED.identifier",
        hint:     "ED.data.hints.ClearIdentifierForThis"
      } ),
      level: new fields.NumberField( {
        required: true,
        nullable: false,
        step:     1,
        positive: true,
        initial:  1,
        label:    "ED.level",
        hint:     "ED.TheLevelThisAdvancementDescribes"
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