import ED4E from "../../config/_module.mjs";
import EdRollOptions from "./common.mjs";

export default class KnockdownRollOptions extends EdRollOptions {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.KnockdownRollOptions",
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      KnockdownAbilityUuid: new fields.DocumentUUIDField( {
        type:     "Item",
        embedded: true,
      } ),
      rollType: new fields.StringField( {
        required: false,
        nullable: true,
        blank:    true,
        initial:  "knockdown",
        choices:  ED4E.ROLLS.rollTypes,
      } ),
    } );
  }

  /** @inheritDoc */
  static fromActor( data, actor, options = {} ) {
    const rollOptions = super.fromActor( data, actor, options ).toObject();

    rollOptions.testType = "action";
    rollOptions.rollType = "knockdown";

    return new this( rollOptions, actor, options );
  }

}