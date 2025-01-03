import { ItemDataModel } from "../../abstract.mjs";
import ThreadBaseData from "../../thread/thread-base.mjs";


/**
 * Data model template with information on Ability items.
 * @property {object} threadData Thread data Object
 * @mixin
 */
export default class ThreadTemplate extends ItemDataModel {

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), { 
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