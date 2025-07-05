import EdRollOptions from "./common.mjs";
import { createContentAnchor } from "../../utils.mjs";
import { MAGIC } from "../../config/_module.mjs";
import { getSetting } from "../../settings.mjs";

export default class HorrorMarkRollOptions extends EdRollOptions {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.HorrorMarkRollOptions",
  ];

  /** @inheritdoc */
  static TEST_TYPE = "action";

  /** @inheritdoc */
  static ROLL_TYPE = "horrorMark";

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
  _prepareStepData( data ) {
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

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.horror = await fromUuid( this.horrorUuid );
    newContext.caster = await fromUuid( this.casterUuid );

    return newContext;
  }
}