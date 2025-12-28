import ActorDataModel from "../../abstract/actor-data-model.mjs";

export default class NoneCharacterTemplate extends ActorDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Actor.NoneCharacter",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      isMob: new fields.BooleanField( {
        required: true,
        initial:  false,
      } ),
      challenge: new fields.SchemaField( {
        rate: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
        } ),
      } ),
      actions: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      1,
        step:     1,
        initial:  1,
        integer:  true,
      } ),
    } );
  }
}