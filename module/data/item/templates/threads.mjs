import { ItemDataModel } from "../../abstract.mjs";
import ThreadBaseData from "../../thread/thread-base.mjs";


/**
 * Data model template with information on Ability items.
 * @property {boolean} isThreadItem is this item a thread item or not
 * @mixin
 */
export default class ThreadTemplate extends ItemDataModel {

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), { 
      isThreadItem: new fields.BooleanField( {
        required: true,
        nullable: false,
        initial:  false,
        label:    this.labelKey( "PhysicalItems.isThreadItem" ),
        hint:     this.hintKey( "PhysicalItems.isThreadItem" )
      } ),
      threadData: new fields.EmbeddedDataField(
        ThreadBaseData,
        {
          required: true,
          label:    this.labelKey( "PhysicalItems.threadData" ),
          hint:     this.hintKey( "PhysicalItems.threadData" )
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