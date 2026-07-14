import ActorDataModel from "../../abstract/actor-data-model.mjs";

/**
 * @import { NoneCharacterData } from "./_types.mjs";
 */

/**
 * A template for all actors that do not represent a playable character, i.e., creatures,
 * horrors, dragons, spirits, and NPCs.
 * @augments {ActorDataModel<NoneCharacterData>}
 * @see {@link NoneCharacterData} The system data model for this template.
 */
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