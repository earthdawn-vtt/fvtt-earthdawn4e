import EdRollOptions from "./common.mjs";
import ED4E from "../../config/_module.mjs";

/**
 * Roll options for recovery rolls.
 * @augments { EdRollOptions }
 * @property { string } recoveryMode The recovery mode, which can be one
 * of the keys in {@link module:config~WORKFLOWS~recoveryModes}.
 * @property { boolean } [ignoreWounds=false] Whether to ignore penalties from wounds during the recovery roll.
 */
export default class RecoveryRollOptions extends EdRollOptions {

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.RecoveryRollOptions",
  ];

  /** @inheritdoc */
  static TEST_TYPE = "effect";

  /** @inheritdoc */
  static ROLL_TYPE = "recovery";

  /** @inheritdoc */
  static GLOBAL_MODIFIERS = [
    "allEffects",
    "allRecoveryTests",
    ...super.GLOBAL_MODIFIERS,
  ];

  // endregion

  // region Static Methods

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
  static fromData( data, options = {} ) {
    return /** @type { RecoveryRollOptions } */ super.fromData( data, options );
  }

  /** @inheritDoc */
  static fromActor( data, actor, options = {} ) {
    return /** @type { RecoveryRollOptions } */ super.fromActor( data, actor, options );
  }

  // endregion

}