import EdRollOptions from "./common.mjs";
import ED4E from "../../config/_module.mjs";

/**
 * @typedef { object } RecoveryRollOptionsInitializationData
 * @augments { EdRollOptionsInitializationData }
 * @property { string } recoveryMode The recovery mode, which can be one
 * of the keys in {@link module:config~WORKFLOWS~recoveryModes}.
 * @property { boolean } [ignoreWounds=false] Whether to ignore penalties from wounds during the recovery roll.
 * @property { ActorEd } [actor] The actor performing the recovery roll. Can be omitted if `rollingActorUuid` from
 * {@link EdRollOptions} is provided.
 */

/**
 * Roll options for recovery rolls.
 * @augments { EdRollOptions }
 * @property { string } recoveryMode The recovery mode, which can be one
 * of the keys in {@link module:config~WORKFLOWS~recoveryModes}.
 * @property { boolean } [ignoreWounds=false] Whether to ignore penalties from wounds during the recovery roll.
 */
export default class RecoveryRollOptions extends EdRollOptions {

  // region Schema

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      recoveryMode: new fields.StringField( {
        initial:  "recovery",
        choices:  ED4E.WORKFLOWS.recoveryMode,
      } ),
      ignoreWounds: new fields.BooleanField( {
        initial:  false,
      } ),
    } );
  }

  // endregion

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

  /**
   * @inheritDoc
   * @param { RecoveryRollOptionsInitializationData & Partial<RecoveryRollOptions> } data The data to initialize the roll options with.
   * @returns { RecoveryRollOptions } A new instance of RecoveryRollOptions.
   */
  static fromData( data, options = {} ) {
    return /** @type { RecoveryRollOptions } */ super.fromData( data, options );
  }

  /**
   * @inheritDoc
   * @param { RecoveryRollOptionsInitializationData & Partial<RecoveryRollOptions> } data The data to initialize the roll options with.
   * @returns { RecoveryRollOptions } A new instance of RecoveryRollOptions.
   */
  static fromActor( data, actor, options = {} ) {
    return /** @type { RecoveryRollOptions } */ super.fromActor( data, actor, options );
  }

  // endregion

  // region Data Initialization

  /** @inheritdoc */
  static _prepareStepData( data ) {
    if ( data.step ) return data.step;

    const actor = data.actor ?? fromUuidSync( data.rollingActorUuid );

    const modifiers = {};
    if ( data.recoveryMode === "recoverStun" && actor.system.characteristics.recoveryTestsResource.stunRecoveryAvailable ) {
      modifiers[ game.i18n.localize(
        "ED.Rolls.Modifiers.stunRecoveryWillpower"
      ) ] = actor.system.attributes.wil.step;
    }

    return {
      base:    actor.system.characteristics.recoveryTestsResource.step,
      modifiers,
    };
  }

  // endregion

}