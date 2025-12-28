import EdRollOptions from "./common.mjs";
import { getSetting } from "../../settings.mjs";
import { createContentAnchor } from "../../utils.mjs";

/**
 * @typedef { object } AbilityRollOptionsInitializationData
 * @augments { EdRollOptionsInitializationData }
 * @property { ItemEd } [ability] The ability being rolled.  Must have the `rankFinal` property in its `system` data.
 * Can be omitted if `abilityUuid` is provided.
 * @property { string } [abilityUuid] The UUID of the ability being rolled.
 * Can be omitted if `ability` is provided.
 */

/**
 * Roll options for ability rolls.
 * @augments { EdRollOptions }
 * @property { string } abilityUuid The UUID of the ability being rolled.
 */
export default class AbilityRollOptions extends EdRollOptions {

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.AbilityRollOptions",
  ];

  /** @inheritdoc */
  static TEST_TYPE = "action";

  /** @inheritdoc */
  static ROLL_TYPE = "ability";

  /** @inheritdoc */
  static GLOBAL_MODIFIERS = [
    "allActions",
    ...super.GLOBAL_MODIFIERS,
  ];

  // endregion

  // region Static Methods

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      abilityUuid: new fields.DocumentUUIDField( {
        type:     "Item",
        embedded: true,
      } ),
    } );
  }

  /**
   * @inheritdoc
   * @returns { AbilityRollOptions } A new instance of AbilityRollOptions.
   */
  static fromData( data, options = {} ) {
    if ( data.ability && !data.abilityUuid ) data.abilityUuid = data.ability.uuid;

    return /** @type { AbilityRollOptions } */ super.fromData( data, options );
  }

  /**
   * @inheritDoc
   * @returns { AbilityRollOptions } A new instance of AbilityRollOptions.
   */
  static fromActor( data, actor, options = {} ) {
    return /** @type { AbilityRollOptions } */ super.fromActor( data, actor, options );
  }

  // endregion

  // region Data Initialization

  /** @inheritDoc */
  static _prepareStepData( data ) {
    if ( data.step ) return data.step;

    const ability = data.ability ?? fromUuidSync( data.abilityUuid );
    return {
      base:      ability.system.rankFinal,
      modifiers: {},
    };
  }

  /** @inheritDoc */
  static _prepareStrainData( data ) {
    if ( data.strain ) return data.strain;

    const ability = data.ability ?? fromUuidSync( data.abilityUuid );
    return {
      base:      ability.system.strain ?? 0,
      modifiers: {},
    };
  }

  /** @inheritDoc */
  static _prepareTargetDifficulty( data ) {
    if ( data.target ) return data.target;

    const ability = data.ability ?? fromUuidSync( data.abilityUuid );
    return {
      base:      ability.system.getDifficulty() ?? getSetting( "minimumDifficulty" ),
      modifiers: {},
    };
  }

  /** @inheritDoc */
  _getChatFlavor() {
    const ability = fromUuidSync( this.abilityUuid );
    return ability.system.summary?.value ?? super._getChatFlavor();
  }

  /** @inheritDoc */
  _getChatFlavorData() {
    return {
      sourceActor: createContentAnchor( fromUuidSync( this.rollingActorUuid ) ).outerHTML,
      ability:     createContentAnchor( fromUuidSync( this.abilityUuid ) ).outerHTML,
      step:        this.step.total,
    };
  }

  // endregion

  // region Rendering

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.ability = /** @type {ItemEd} */ await fromUuid( this.abilityUuid );
    newContext.abilityContentAnchor = createContentAnchor( newContext.ability )?.outerHTML;

    newContext.hasEffects = newContext.ability?.effects.size > 0;
    newContext.itemForEffects = newContext.ability;

    newContext.rollingActor = await fromUuid( this.rollingActorUuid );
    newContext.rollingActorTokenDocument = await context.rollingActor?.getTokenDocument();

    return newContext;
  }

  // endregion

}