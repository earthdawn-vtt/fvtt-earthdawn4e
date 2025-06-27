import EdRollOptions from "./common.mjs";
import { createContentAnchor } from "../../utils.mjs";
import { EFFECTS } from "../../config/_module.mjs";


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
    const ability = fromUuidSync( data.spellcastingAbility );
    const actor = fromUuidSync( data.rollingActorUuid );
    return {
      base:      ability.system.rankFinal,
      modifiers: {
        [ EFFECTS.globalBonuses.allSpellcasting.label ]: actor.system.globalBonuses.allSpellcasting.value,
        [ EFFECTS.globalBonuses.allSpellTests.label ]:   actor.system.globalBonuses.allSpellTests.value,
        [ EFFECTS.globalBonuses.allTests.label ]:        actor.system.globalBonuses.allTests.value,
      },
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