import EdRollOptions from "./common.mjs";
import { getSetting } from "../../settings.mjs";

/**
 * Roll options for jump up tests.
 * @typedef {object} JumpUpRollOptionsInitializationData
 * @augments {EdRollOptionsInitializationData}
 * @property {ActorEd} [actor] The actor jumping up. Can be omitted if `rollingActorUuid` in
 * {@link JumpUpRollOptions} is provided.
 * @property {ItemEd} [jumpUpAbility] The jump up ability used for the test. Can be
 * omitted if `jumpUpAbilityUuid` in {@link JumpUpRollOptions} is provided.
 */

/**
 * Roll options for jump up tests.
 * @augments {EdRollOptions}
 */
export default class JumpUpRollOptions extends EdRollOptions {

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.JumpUpRollOptions",
  ];

  /** @inheritdoc */
  static TEST_TYPE = "action";

  /** @inheritdoc */
  static ROLL_TYPE = "jumpUp";

  // endregion

  // region Static Methods

  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
      jumpUpAbilityUuid: new foundry.data.fields.DocumentUUIDField( {
        required: true,
        type:     "Item",
        embedded: true,
      } ),
    } );
  }

  /**
   *  @inheritDoc
   *  @param { JumpUpRollOptionsInitializationData & Partial<JumpUpRollOptions> } data The data to initialize
   *  the roll options with.
   */
  static fromData( data, options = {} ) {
    data.jumpUpAbilityUuid ??= data.jumpUpAbility?.uuid;

    return /** @type { JumpUpRollOptions } */ super.fromData( data, options );
  }

  /**
   * @inheritDoc
   * @param { JumpUpRollOptionsInitializationData & Partial<JumpUpRollOptions> } data The data to initialize the roll options with.
   */
  static fromActor( data, actor, options = {} ) {
    return /** @type { JumpUpRollOptions } */ super.fromActor( data, actor, options );
  }

  // endregion

  // region Data Initialization

  /** @inheritDoc */
  static _prepareStepData( data ) {
    const jumpUpAbility = data.jumpUpAbility ?? fromUuidSync( data.jumpUpAbilityUuid );
    if ( jumpUpAbility ) {
      return {
        base:      jumpUpAbility.system.rankFinal,
      };
    }

    const actor = data.actor ?? fromUuidSync( data.rollingActorUuid );
    return {
      base:      actor.system.attributes.dex.step,
    };
  }

  /** @inheritDoc */
  static _prepareStrainData( data ) {
    const jumpUpAbility = data.jumpUpAbility ?? fromUuidSync( data.jumpUpAbilityUuid );
    return {
      base:      jumpUpAbility?.system.strain.base ?? getSetting( "jumpUpStrainCost" ),
      modifiers: jumpUpAbility?.system.strain.modifiers ?? {},
    };
  }

  /** @inheritDoc */
  static _prepareTargetDifficulty( data ) {
    return {
      base: getSetting( "jumpUpBaseDifficulty" ),
    };
  }

  // endregion

  // region Rendering

  /** @inheritDoc */
  _getChatFlavorData() {
    return {
      /* sourceActor:         createContentAnchor( fromUuidSync( this.rollingActorUuid ) ).outerHTML,
      spell:               createContentAnchor( fromUuidSync( this.spellUuid ) ).outerHTML,
      spellcastingAbility: createContentAnchor( fromUuidSync( this.spellcastingAbilityUuid ) ).outerHTML, */
    };
  }

  /** @inheritdoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    return newContext;
  }

  // endregion

}