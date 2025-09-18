import { createContentAnchor } from "../../utils.mjs";
import EdRollOptions from "./common.mjs";

/**
 * @typedef { object } EdKnockdownRollOptionsInitializationData
 * @augments { EdRollOptionsInitializationData }
 * @property { ItemEd | null } [knockdownAbility] The knockdown ability item.
 * Can be omitted if `knockdownAbilityUuid` in {@link KnockdownRollOptions} is provided.
 * @property { ActorEd } [actor] The actor making the knockdown test.
 * Can be omitted if `rollingActorUuid` in {@link KnockdownRollOptions} is provided.
 * @property { number } damageTaken The damage taken that triggered the knockdown test.
 */

/**
 * Roll options for knockdown tests.
 * @augments { EdRollOptions }
 * @property { string | null } knockdownAbilityUuid The UUID of the knockdown ability item.
 */
export default class KnockdownRollOptions extends EdRollOptions {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.KnockdownRollOptions",
  ];

  /** @inheritdoc */
  static TEST_TYPE = "action";

  /** @inheritdoc */
  static ROLL_TYPE = "knockdown";

  /**
   * The global bonuses that are applied to the step of all rolls of this type.
   * @type {[string]}
   */
  static GLOBAL_MODIFIERS = [
    ...super.GLOBAL_MODIFIERS,
    "allKnockdownTests",
  ];

  /** @inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      knockdownAbilityUuid: new fields.DocumentUUIDField( {
        type:     "Item",
        embedded: true,
        nullable: true,
      } ),
    } );
  }

  /**
   * @inheritdoc
   * @param {EdKnockdownRollOptionsInitializationData & Partial<KnockdownRollOptions>} data This is the initial data to create the roll options from.
   */
  static fromData( data, options = {} ) {
    data.knockdownAbilityUuid ??= data.knockdownAbility?.uuid;
    return /** @type { KnockdownRollOptions } */ super.fromData( data, options );
  }

  /**
   * @inheritdoc
   * @param {EdKnockdownRollOptionsInitializationData & Partial<KnockdownRollOptions>} data The initial data with which to create the roll options.
   */
  static fromActor( data, actor, options = {} ) {
    return /** @type {KnockdownRollOptions} */ super.fromActor( data, actor, options );
  }

  /** @inheritdoc */
  static _prepareStepData( data ) {
    const knockdownAbility = data.knockdownAbility ?? fromUuidSync( data.knockdownAbilityUuid );
    if ( knockdownAbility ) {
      return {
        base:      knockdownAbility.system.rankFinal,
      };
    } else {
      const actor = data.actor ?? fromUuidSync( data.rollingActorUuid );
      return {
        base: actor.system.knockdownStep,
      };
    }
  }

  /** @inheritdoc */
  static _prepareTargetDifficulty( data ) {
    const actor = data.actor ?? fromUuidSync( data.rollingActorUuid );
    const woundThreshold = actor.system.characteristics.health.woundThreshold;
    return {
      base: Math.max( data.damageTaken - woundThreshold, 0 ),
    };
  }

  /** @inheritdoc */
  static _prepareStrainData( data ) {
    const knockdownAbility = data.knockdownAbility ?? fromUuidSync( data.knockdownAbilityUuid );
    return {
      base: knockdownAbility?.system.strain || 0,
    };
  }

  /** @inheritdoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.knockdownAbility = await fromUuid( this.knockdownAbilityUuid );
    newContext.knockdownAbilityContentAnchor = newContext.knockdownAbility
      ? createContentAnchor( newContext.knockdownAbility ).outerHTML
      : null;
    
    return newContext;
  }


}