import { ActiveEffectDataModel } from "../abstract.mjs";
import EarthdawnActiveEffectChangeData from "./eae-change-data.mjs";
import EarthdawnActiveEffectDurationData from "./eae-duration.mjs";


/**
 * @implements {ActiveEffectData}
 */
export default class EarthdawnActiveEffectData extends ActiveEffectDataModel {

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;

    return this.mergeSchema( super.defineSchema(), {
      changes: new fields.EmbeddedDataField( EarthdawnActiveEffectChangeData, {
        label:  this.labelKey( "changes" ),
        hint:   this.hintKey( "changes" ),
      } ),
      duration: new fields.EmbeddedDataField( EarthdawnActiveEffectDurationData, {
        label:  this.labelKey( "duration" ),
        hint:   this.hintKey( "duration" ),
      } ),
      transferToTarget: new fields.BooleanField( {
        initial: false,
        label:   this.labelKey( "transferToTarget" ),
        hint:    this.hintKey( "transferToTarget" ),
      } ),
    } );
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /**
   * Is this effect always active, that is, has no limited duration.
   * @type {boolean}
   */
  get permanent() {
    return this.duration.type === "permanent";
  }

}