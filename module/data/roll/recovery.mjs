import EdRollOptions from "./common.mjs";
import ED4E from "../../config/_module.mjs";

export default class RecoveryRollOptions extends EdRollOptions {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.RecoveryRollOptions",
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      recoveryMode: new fields.StringField( {
        initial:  "recovery",
        choices:  ED4E.WORKFLOWS.recoveryMode,
      } ),
      rollType: new fields.StringField( {
        required: false,
        nullable: true,
        blank:    true,
        initial:  "recovery",
        choices:  ED4E.ROLLS.rollTypes,
      } ),
      ignoreWounds: new fields.BooleanField( {
        initial:  false,
      } ),
    } );
  }

  /** @inheritDoc */
  static fromActor( data, actor, options = {} ) {
    const rollOptions = super.fromActor( data, actor, options ).toObject();

    rollOptions.recoveryMode = data.recoveryMode || "recovery";
    rollOptions.testType = "effect";
    rollOptions.rollType = "recovery";
    rollOptions.ignoreWounds = data.ignoreWounds || false;

    return new this( rollOptions, actor, options );
  }

}