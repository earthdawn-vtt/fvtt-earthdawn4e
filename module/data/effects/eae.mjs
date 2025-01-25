import { ActiveEffectDataModel } from "../abstract.mjs";


/**
 * @implements {ActiveEffectData}
 */
export default class EarthdawnActiveEffectData extends ActiveEffectDataModel {

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;

    return this.mergeSchema( super.defineSchema(), {
      transferToTarget: new fields.BooleanField( {
        initial: false,
        label:   this.labelKey( "transferToTarget" ),
        hint:    this.hintKey( "transferToTarget" ),
      } ),
    } );
  }

}