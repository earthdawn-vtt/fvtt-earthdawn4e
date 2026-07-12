import EdRollOptions from "./common.mjs";
import { getSetting } from "../../helpers/settings.mjs";
import * as STATUSES from "../../config/statuses.mjs";
import { createContentAnchor } from "../../helpers/formatting.mjs";

/**
 * @import { JumpUpRollOptionsSystemData, JumpUpRollOptionsInitializationData } from "./_types.mjs";
 */

/**
 * Roll options for jump up tests.
 * @augments {EdRollOptions<JumpUpRollOptionsSystemData>}
 * @see {@link JumpUpRollOptionsSystemData} The system data model for jump up roll options.
 * @see {@link JumpUpRollOptionsInitializationData} The initialization data for jump up roll options.
 */
export default class JumpUpRollOptions extends EdRollOptions {

  // region Schema

  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
      jumpUpAbilityUuid: new foundry.data.fields.DocumentUUIDField( {
        required: true,
        type:     "Item",
        embedded: true,
      } ),
    } );
  }

  // endregion

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

  /**
   *  @inheritDoc
   *  @param { JumpUpRollOptionsInitializationData & Partial<JumpUpRollOptionsSystemData> } data The data to initialize
   *  the roll options with.
   */
  static fromData( data, options = {} ) {
    data.jumpUpAbilityUuid ??= data.jumpUpAbility?.uuid;

    return /** @type { JumpUpRollOptions } */ super.fromData( data, options );
  }

  /**
   * @inheritDoc
   * @param { JumpUpRollOptionsInitializationData & Partial<JumpUpRollOptionsSystemData> } data The data to initialize the roll options with.
   */
  static fromActor( data, actor, options = {} ) {
    return /** @type { JumpUpRollOptions } */ super.fromActor( data, actor, options );
  }

  // endregion

  // region Data Initialization

  /** @inheritDoc */
  static _prepareStepData( data ) {
    const jumpUpAbility = data.jumpUpAbility ?? fromUuidSync( data.jumpUpAbilityUuid );
    const actor = data.actor ?? fromUuidSync( data.rollingActorUuid );

    const modifiers = {};
    if ( actor.statuses.has( "knockedDown" ) ) {
      modifiers[
        _loc( "ED.Rolls.Modifiers.jumpUpNoKnockdownPenalty" )
      ] = -this.#getKnockedDownModifier();
    }
    return {
      base:      jumpUpAbility?.system.rankFinal ?? actor.system.jumpUpStep,
      modifiers,
    };
  }


  /**
   * Retrieves the modifier applied when the knockedDown status condition is active.
   * @returns {number} The step modifier for the knockedDown condition.
   */
  static #getKnockedDownModifier() {
    return STATUSES.STATUS_CONDITIONS.knockedDown.changes.find(
      change => change.key === "system.globalModifiers.allTests.value"
    ).value;
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
  _getChatFlavor() {
    const jumpUpAbility = fromUuidSync( this.jumpUpAbilityUuid );
    return jumpUpAbility?.system.summary?.value ?? "";
  }

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

    newContext.jumpUpAbility = /** @type {ItemEd} */ await fromUuid( this.jumpUpAbilityUuid );
    newContext.jumpUpAbilityContentAnchor = newContext.jumpUpAbility ? createContentAnchor( newContext.jumpUpAbility )?.outerHTML : undefined;

    return newContext;
  }

  // endregion

}