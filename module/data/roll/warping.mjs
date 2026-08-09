import EdRollOptions from "./common.mjs";
import * as MAGIC from "../../config/magic.mjs";
import { createContentAnchor } from "../../helpers/formatting.mjs";

/**
 * @import { WarpingRollOptionsSystemData, EdWarpingRollOptionsInitializationData } from "./_types.mjs";
 */

/**
 * Roll options for potential warping effects when casting spells.
 * @augments {EdRollOptions<WarpingRollOptionsSystemData>}
 * @see {@link WarpingRollOptionsSystemData} The system data model for warping roll options.
 * @see {@link EdWarpingRollOptionsInitializationData} The initialization data for warping roll options.
 */
export default class WarpingRollOptions extends EdRollOptions {

  // region Schema

  /** @inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      astralSpacePollution: new fields.StringField( {
        required: true,
        choices:  MAGIC.astralSpacePollution,
      } ),
      casterUuid: new fields.DocumentUUIDField( {
        required: true,
        type:     "Actor",
      } ),
      spellUuid: new fields.DocumentUUIDField( {
        required: true,
        type:     "Item",
      } ),
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.WarpingRollOptions",
  ];

  /** @inheritdoc */
  static TEST_TYPE = "action";

  /** @inheritdoc */
  static ROLL_TYPE = "warping";

  // endregion

  // region Static Methods

  /**
   *  @inheritDoc
   *  @param { EdWarpingRollOptionsInitializationData & Partial<WarpingRollOptionsSystemData> } data The data to initialize
   *  the roll options with.
   */
  static fromData( data, options = {} ) {
    data.casterUuid ??= data.caster?.uuid;
    data.spellUuid ??= data.spell?.uuid;

    return /** @type { WarpingRollOptions } */ super.fromData( data, options );
  }

  /**
   * This method is not applicable for warping rolls and will throw an error if called.
   * @inheritdoc
   * @throws Error Warping rolls do not use rolling actors. Use {@link WarpingRollOptions~fromData} instead, and supply the target as `caster` or `casterUuid` in the data.
   */
  static fromActor( data, actor, options = {} ) {
    throw new Error( "WarpingRollOptions.fromActor: A warping roll does not use rolling actors" );
  }

  // endregion

  // region Data Initialization

  /** @inheritDoc */
  _getChatFlavorData() {
    return {
      sourceActor:         createContentAnchor( fromUuidSync( this.casterUuid ) ).outerHTML,
      pollution:           MAGIC.astralSpacePollution[ this.astralSpacePollution ].label,
    };
  }

  /** @inheritDoc */
  static _prepareStepData( data ) {
    const spell = data.spell ?? fromUuidSync( data.spellUuid );
    const pollution = MAGIC.astralSpacePollution[ data.astralSpacePollution ];
    const warpModifier = pollution.rawMagic.warpingModifier;

    return {
      base:      spell.system.level,
      modifiers: {
        [ pollution.label ]: warpModifier,
      },
    };
  }

  /** @inheritDoc */
  static _prepareStrainData( data ) {
    return null;
  }

  /** @inheritDoc */
  static _prepareTargetDifficulty( data ) {
    const actor = data.caster ?? fromUuidSync( data.casterUuid );
    return {
      base: actor.system.characteristics.defenses.mystical.baseValue,
    };
  }

  // endregion

  // region Rendering

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.spell = await fromUuid( this.spellUuid );
    newContext.spellContentAnchor = createContentAnchor( newContext.spell ).outerHTML;
    newContext.astralSpacePollution = MAGIC.astralSpacePollution[ this.astralSpacePollution ].label;

    return newContext;
  }

  // endregion

}