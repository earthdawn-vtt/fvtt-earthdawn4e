import { ActorDataModel } from "../../abstract.mjs";
import ThreadBaseData from "../../thread/thread-base.mjs";


/**
 * Data model template for Threads of Actors.
 * @property {object} threadData Thread data Object
 * @mixin
 */
export default class ThreadTemplate extends ActorDataModel {

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), { 
      threadData: new fields.EmbeddedDataField(
        ThreadBaseData,
        {
          required: true,
          label:    this.labelKey( "Actor.threadData" ),
          hint:     this.hintKey( "Actor.threadData" )
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