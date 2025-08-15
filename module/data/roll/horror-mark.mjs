import EdRollOptions from "./common.mjs";
import { createContentAnchor } from "../../utils.mjs";
import { MAGIC } from "../../config/_module.mjs";
import { getSetting } from "../../settings.mjs";

/**
 * @typedef { object } EdHorrorMarkRollOptionsInitializationData
 * @augments { EdRollOptionsInitializationData }
 * @property { ActorEd } caster The actor that is casting the horror mark.
 * Can be omitted if `casterUuid` in {@link HorrorMarkRollOptions} is provided.
 * @property { ActorEd } [horror] The horror that is trying to mark the target.
 * Can be omitted if `horrorUuid` in {@link HorrorMarkRollOptions} is provided.
 * @property { ItemEd } [spell] The spell that is causing the horror mark,
 * Can be omitted if `spellUuid` in {@link HorrorMarkRollOptions} is provided
 */

/**
 * Roll options for horror mark rolls.
 * @augments { EdRollOptions }
 * @property { string } casterUuid The UUID of the actor that is casting the horror mark.
 * @property { string } [astralSpacePollution] The astral space pollution level. Should be one of the keys
 * in {@link module:config~MAGIC~astralSpacePollution}.
 * @property { string } [horrorUuid] The UUID of the horror that is trying to mark the target.
 * @property { string } [spellUuid] The spell that is causing the horror mark, if applicable.
 */
export default class HorrorMarkRollOptions extends EdRollOptions {

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.HorrorMarkRollOptions",
  ];

  /** @inheritdoc */
  static TEST_TYPE = "action";

  /** @inheritdoc */
  static ROLL_TYPE = "horrorMark";

  // endregion

  // region Static Methods

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      astralSpacePollution: new fields.StringField( {
        required: false,
        choices:  MAGIC.astralSpacePollution,
      } ),
      horrorUuid: new fields.DocumentUUIDField( {
        required: false,
        type:     "Actor",
      } ),
      spellUuid: new fields.DocumentUUIDField( {
        required: false,
        type:     "Item",
      } ),
      casterUuid: new fields.DocumentUUIDField( {
        required: true,
        type:     "Actor",
      } ),
    } );
  }

  /**
   * @inheritDoc
   * @param { EdHorrorMarkRollOptionsInitializationData & Partial<HorrorMarkRollOptions> } data The data to initialize the roll options with.
   * @returns { HorrorMarkRollOptions } A new instance of HorrorMarkRollOptions.
   */
  static fromActor( data, actor, options = {} ) {
    return /** @type { HorrorMarkRollOptions } */ super.fromActor( data, actor, options );
  }

  /**
   * @inheritDoc
   * @param { EdHorrorMarkRollOptionsInitializationData & Partial<HorrorMarkRollOptions> } data The data to initialize the roll options with.
   * @returns { HorrorMarkRollOptions } A new instance of HorrorMarkRollOptions.
   */
  static fromData( data, options = {} ) {
    return /** @type { HorrorMarkRollOptions } */ super.fromData( data, options );
  }

  // endregion

  // region Data Initialization

  /** @inheritDoc */
  _getChatFlavorData() {
    const horror = this.horrorUuid ?
      createContentAnchor( fromUuidSync( this.horrorUuid ) ).outerHTML :
      game.i18n.localize( "ED.Chat.Flavor.aHorror" );
    return {
      caster:   createContentAnchor( fromUuidSync( this.casterUuid ) ).outerHTML,
      horror,
    };
  }

  /** @inheritDoc */
  static _prepareStepData( data ) {
    if ( data.step ) return data.step;

    const horror = data.horror ?? fromUuidSync( data.horrorUuid );
    if ( !horror ) {
      ui.notifications.info(
        "ED.Notifications.Info.upcomingSelectHorrorForRawCasting",
        {
          localize: true,
        },
      );
    }
    const horrorMarkAbility = horror?.getSingleItemByEdid(
      getSetting( "edidSpellcasting" ),
    );

    const spell = data.spell ?? fromUuidSync( data.spellUuid );
    const pollution = MAGIC.astralSpacePollution?.[ data.astralSpacePollution ];
    const markModifier = pollution.rawMagic.horrorMarkModifier;

    const base = horrorMarkAbility?.system?.level ?? spell?.system?.level ?? 1;
    const modifiers = {};
    if ( markModifier ) {
      modifiers[ pollution.label ] = markModifier;
    }

    return {
      base,
      modifiers,
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

    newContext.horror = await fromUuid( this.horrorUuid );
    newContext.caster = await fromUuid( this.casterUuid );

    return newContext;
  }

  // endregion
}