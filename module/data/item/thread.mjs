import SystemDataModel from "../abstract.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import PatternThreadData from "../threads/thread-base.mjs";

/**
 * Data model template with information on items that represents threads weaved to patterns.
 */
export default class ThreadData extends SystemDataModel.mixin(
  ItemDescriptionTemplate
)  {

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      level: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "Thread.level" ),
        hint:     this.hintKey( "Thread.level" )
      } ),
      pattern: new fields.EmbeddedDataField(
        PatternThreadData,
        {
          required: true,
          label:    "ED.thread",
          hint:     "ED.threadHint"
        }
      )
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