import EdRollOptions from "./common.mjs";
import { createContentAnchor } from "../../utils.mjs";


export default class SpellcastingRollOptions extends EdRollOptions {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.SpellcastingRollOptions",
  ];

  /** @inheritdoc */
  static TEST_TYPE = "action";

  /** @inheritdoc */
  static ROLL_TYPE = "spellcasting";

  /** @inheritdoc */
  static GLOBAL_MODIFIERS = [
    "allSpellcasting",
    "allSpellTests",
    "allActions",
    ...super.GLOBAL_MODIFIERS,
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      spell: new fields.DocumentUUIDField( {
        required: true,
        type:     "Item",
      } ),
      spellcastingAbility: new fields.DocumentUUIDField( {
        required: true,
        type:     "Item",
        embedded: true,
      } ),
    } );
  }

  /** @inheritDoc */
  _getChatFlavorData() {
    return {
      sourceActor:         createContentAnchor( fromUuidSync( this.rollingActorUuid ) ).outerHTML,
      spell:               createContentAnchor( fromUuidSync( this.spell ) ).outerHTML,
      spellcastingAbility: createContentAnchor( fromUuidSync( this.spellcastingAbility ) ).outerHTML,
    };
  }

  /** @inheritDoc */
  _prepareStepData( data ) {
    if ( data.step ) return data.step;

    const ability = fromUuidSync( data.spellcastingAbility );
    return {
      base:      ability.system.rankFinal,
    };
  }

  /** @inheritDoc */
  _prepareStrainData( data ) {
    const ability = fromUuidSync( data.spellcastingAbility );
    return {
      base: ability.system.strain,
    };
  }

  /** @inheritDoc */
  _prepareTargetDifficulty( data ) {
    const spell = fromUuidSync( data.spell );
    return {
      base: spell.system.getDifficulty(),
    };
  }

}