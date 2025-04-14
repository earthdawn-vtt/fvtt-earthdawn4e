import { ActorDataModel } from "../../abstract.mjs";

export default class NoneCharacterTemplate extends ActorDataModel {
  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      isMob: new fields.BooleanField( {
        required: true,
        initial:  false,
        label:    this.labelKey( "isMob" ),
        hint:     this.hintKey( "isMob" ),
      } ),
      challenge: new fields.SchemaField( {
        rate: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
          label:    this.labelKey( "challengeRate" ),
          hint:     this.hintKey( "challengeRate" )
        } ),
      }, {
        label: this.labelKey( "challenge" ),
        hint:  this.hintKey( "challenge" ),
      } ),
      actions: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      1,
        step:     1,
        initial:  1,
        integer:  true,
        label:    this.labelKey( "actions" ),
        hint:     this.hintKey( "actions" ),
      } ),
    } );
  }
}