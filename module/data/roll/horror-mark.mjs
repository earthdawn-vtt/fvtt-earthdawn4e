import EdRollOptions from "./common.mjs";
import { getSetting } from "../../helpers/settings.mjs";
import * as MAGIC from "../../config/magic.mjs";
import { createContentAnchor } from "../../helpers/formatting.mjs";

/**
 * @import { HorrorMarkRollOptionsSystemData, EdHorrorMarkRollOptionsInitializationData } from "./_types.mjs";
 */

/**
 * Roll options for horror mark rolls.
 * @augments {EdRollOptions<HorrorMarkRollOptionsSystemData>}
 * @see {@link HorrorMarkRollOptionsSystemData} The system data model for horror mark roll options.
 * @see {@link EdHorrorMarkRollOptionsInitializationData} The initialization data for horror mark roll options.
 */
export default class HorrorMarkRollOptions extends EdRollOptions {

  // region Schema

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

  // endregion

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

  /**
   * @inheritDoc
   * @param { EdHorrorMarkRollOptionsInitializationData & Partial<HorrorMarkRollOptionsSystemData> } data The data to initialize the roll options with.
   */
  static fromActor( data, actor, options = {} ) {
    return /** @type { HorrorMarkRollOptions } */ super.fromActor( data, actor, options );
  }

  /**
   * @inheritDoc
   * @param { EdHorrorMarkRollOptionsInitializationData & Partial<HorrorMarkRollOptionsSystemData> } data The data to initialize the roll options with.
   */
  static fromData( data, options = {} ) {
    data.casterUuid ??= data.caster?.uuid;
    data.horrorUuid ??= data.horror?.uuid;
    data.spellUuid ??= data.spell?.uuid;
    return /** @type { HorrorMarkRollOptions } */ super.fromData( data, options );
  }

  // endregion

  // region Data Initialization

  /** @inheritDoc */
  _getChatFlavorData() {
    const horror = this.horrorUuid
      ? createContentAnchor( fromUuidSync( this.horrorUuid ) ).outerHTML
      : _loc( "ED.Chat.Flavor.aHorror" );
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
    newContext.horrorContentAnchor = newContext.horror
      ? createContentAnchor( newContext.horror ).outerHTML
      : "<a class=\"content-link\">???</a>";
    newContext.caster = await fromUuid( this.casterUuid );
    newContext.casterContentAnchor = createContentAnchor( newContext.caster ).outerHTML;

    return newContext;
  }

  // endregion
}