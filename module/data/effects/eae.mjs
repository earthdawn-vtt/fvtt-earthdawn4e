import { ActiveEffectDataModel } from "../abstract.mjs";


/**
 * @implements {ActiveEffectData}
 */
export default class EarthdawnActiveEffectData extends ActiveEffectDataModel {

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;

    return this.mergeSchema( super.defineSchema(), {
      foo: new fields.BooleanField( { initial: true } ),
    } );
  }

}