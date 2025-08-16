import EdRollOptions from "./common.mjs";
import { MAGIC } from "../../config/_module.mjs";
import { createContentAnchor } from "../../utils.mjs";

/**
 * @typedef { object } EdWarpingRollOptionsInitializationData
 * @augments { EdRollOptionsInitializationData }
 * @property { ItemEd } [caster] The actor casting the spell.
 * Can be omitted if `casterUuid` in {@link WarpingRollOptions} is provided.
 * @property { ItemEd } [spell] The spell being cast.
 * Can be omitted if `spellUuid` in {@link WarpingRollOptions} is provided
 */

/**
 * Roll options for potential warping effects when casting spells.
 * @augments { EdRollOptions }
 * @property { string } astralSpacePollution The type of astral space pollution while casting the spell.
 * @property { string } casterUuid The UUID of the actor casting the spell.
 * @property { string } spellUuid The UUID of the spell being cast.
 */
export default class WarpingRollOptions extends EdRollOptions {

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

  /**
   *  @inheritDoc
   *  @param { EdWarpingRollOptionsInitializationData & Partial<WarpingRollOptions> } data The data to initialize
   *  the roll options with.
   */
  static fromData( data, options = {} ) {
    data.casterUuid ??= data.caster?.uuid;
    data.spellUuid ??= data.spell?.uuid;

    return /** @type { WarpingRollOptions } */ super.fromData( data, options );
  }

  /**
   * This method is not applicable for warping rolls and will throw an error if called.
   * @override
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

}