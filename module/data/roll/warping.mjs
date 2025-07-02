import EdRollOptions from "./common.mjs";
import { MAGIC } from "../../config/_module.mjs";
import { createContentAnchor } from "../../utils.mjs";

export default class WarpingRollOptions extends EdRollOptions {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.WarpingRollOptions",
  ];

  /** @inheritdoc */
  static TEST_TYPE = "action";

  /** @inheritdoc */
  static ROLL_TYPE = "warping";

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

  /** @inheritDoc */
  static fromActor( data, actor, options = {} ) {
    throw new Error( "WarpingRollOptions.fromActor: A warping roll does not use actors" );
  }

  /** @inheritDoc */
  _getChatFlavorData() {
    return {
      sourceActor:         createContentAnchor( fromUuidSync( this.casterUuid ) ).outerHTML,
      pollution:           MAGIC.astralSpacePollution[ this.astralSpacePollution ].label,
    };
  }

  /** @inheritDoc */
  _prepareStepData( data ) {
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
  _prepareStrainData( data ) {
    // TODO: set null when roll refactoring is done
    return {
      base: 0,
    };
  }

  /** @inheritDoc */
  _prepareTargetDifficulty( data ) {
    const actor = data.caster ?? fromUuidSync( data.casterUuid );
    return {
      base: actor.system.characteristics.defenses.mystical.baseValue,
    };
  }

}