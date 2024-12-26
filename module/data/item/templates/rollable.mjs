import SystemDataModel from "../../abstract.mjs";
import ED4E from "../../../config.mjs";

const { fields } = foundry.data;

export default class RollableTemplate extends SystemDataModel {

  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
      rollType: new fields.StringField( {
        required: false,
        nullable: true,
        blank:    true,
        initial:  "",
        choices:  ED4E.rollTypes,
        label:    this.labelKey( "Rollable.type" ),
        hint:     this.hintKey( "Rollable.type" )
      } ),
    } );
  }

}