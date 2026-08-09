import EdRollOptions from "./common.mjs";

import { createContentAnchor } from "../../helpers/formatting.mjs";

/**
 * @import { SpellEffectRollOptionsSystemData, EdSpellEffectRollOptionsInitializationData } from "./_types.mjs";
 */

/**
 * Roll options for non-damage spell effects.
 * @augments {EdRollOptions<SpellEffectRollOptionsSystemData>}
 * @see {@link SpellEffectRollOptionsSystemData} The system data model for spell effect roll options.
 * @see {@link EdSpellEffectRollOptionsInitializationData} The initialization data for spell effect roll options.
 */
export default class SpellEffectRollOptions extends EdRollOptions {

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.SpellEffectRollOptions",
  ];

  /** @inheritdoc */
  static TEST_TYPE = "effect";

  /** @inheritdoc */
  static ROLL_TYPE = "spellEffect";

  /** @inheritdoc */
  static GLOBAL_MODIFIERS = [
    ...super.GLOBAL_MODIFIERS,
    "allEffects",
    "allSpellTests",
  ];

  // endregion

  // region Static Methods

  /** @inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      spellUuid: new fields.DocumentUUIDField( {
        required: true,
        type:     "Item",
      } ),
      willforceUuid: new fields.DocumentUUIDField( {
        nullable: true,
        type:     "Item",
      } ),
    } );
  }

  /**
   * @inheritdoc
   * @param {EdSpellEffectRollOptionsInitializationData & Partial<SpellEffectRollOptionsSystemData>} data The initial data with which to create the roll options.
   */
  static fromData( data, options = {} ) {
    data.spellUuid ??= data.spell?.uuid;
    data.willforceUuid ??= data.willforce?.uuid;

    return /** @type {SpellEffectRollOptions} */ super.fromData( data, options );
  }

  /**
   * @inheritdoc
   * @param {EdSpellEffectRollOptionsInitializationData & Partial<SpellEffectRollOptionsSystemData>} data The initial data with which to create the roll options.
   */
  static fromActor( data, actor, options = {} ) {
    return /** @type {SpellEffectRollOptions} */ super.fromActor( data, actor, options );
  }

  // endregion

  // region Data Initialization

  /** @inheritDoc */
  _getChatFlavorData() {
    return {
      sourceActor:         createContentAnchor( fromUuidSync( this.rollingActorUuid ) ).outerHTML,
      spell:               createContentAnchor( fromUuidSync( this.spellUuid ) ).outerHTML,
    };
  }

  /** @inheritdoc */
  static _prepareStepData( data ) {
    if ( data.step ) return data.step;

    const caster = data.caster ?? fromUuidSync( data.rollingActorUuid );
    const willforce = data.willforce ?? fromUuidSync( data.willforceUuid );
    const spell = data.spell ?? fromUuidSync( data.spellUuid );

    return spell.system.getEffectDetailsRollStepData( {
      actor: caster,
      willforce
    } );
  }

  /** @inheritdoc */
  static _prepareStrainData( data ) {
    if ( data.strain ) return data.strain;

    const willforce = data.willforce ?? fromUuidSync( data.willforceUuid );
    if ( !willforce ) return null;

    return {
      base: willforce.system.strain,
    };
  }

  // endregion

  // region Rendering

  /** @inheritdoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.spell = await fromUuid( this.spellUuid );
    newContext.spellContentAnchor = createContentAnchor( newContext.spell ).outerHTML;
    newContext.willforce = await fromUuid( this.willforceUuid );
    newContext.willforceContentAnchor = newContext.willforce
      ? createContentAnchor( newContext.willforce ).outerHTML
      : null;

    return newContext;
  }

  // endregion

}