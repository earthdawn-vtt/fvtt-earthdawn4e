import EdRollOptions from "./common.mjs";
import { createContentAnchor } from "../../utils.mjs";
import { MAGIC } from "../../config/_module.mjs";
import * as game from "../../hooks/_module.mjs";


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
      spellUuid: new fields.DocumentUUIDField( {
        required: true,
        type:     "Item",
      } ),
      spellcastingAbilityUuid: new fields.DocumentUUIDField( {
        required: true,
        type:     "Item",
        embedded: true,
      } ),
    } );
  }

  // region Data Initialization

  /** @inheritdoc */
  _initializeSource( data, options = {} ) {
    if ( data.grimoire?.system.grimoireBelongsTo?.( data.rollingActorUuid ) ) {
      data.successes ??= {};
      data.successes.additionalExtra ??= 0;
      data.successes.additionalExtra += MAGIC.grimoireModifiers.ownedExtraSuccess;
    }
    return super._initializeSource( data, options );
  }

  /** @inheritDoc */
  _getChatFlavorData() {
    return {
      sourceActor:         createContentAnchor( fromUuidSync( this.rollingActorUuid ) ).outerHTML,
      spell:               createContentAnchor( fromUuidSync( this.spellUuid ) ).outerHTML,
      spellcastingAbility: createContentAnchor( fromUuidSync( this.spellcastingAbilityUuid ) ).outerHTML,
    };
  }

  /** @inheritDoc */
  _prepareStepData( data ) {
    if ( data.step ) return data.step;

    const castingAbility = data.spellcastingAbility ?? fromUuidSync( data.spellcastingAbilityUuid );

    const stepData = castingAbility.system.baseRollOptions.step || {};

    stepData.base ??= castingAbility.system.rankFinal;

    stepData.modifiers ??= {};
    if (
      data.grimoire?.system.isGrimoire
      && !data.grimoire.system.grimoireBelongsTo( data.rollingActorUuid )
    ) {
      stepData.modifiers[
        game.i18n.localize( "ED.Rolls.Modifiers.grimoirePenalty" )
      ] = MAGIC.grimoireModifiers.notOwned;
    }

    return stepData;
  }

  /** @inheritDoc */
  _prepareStrainData( data ) {
    if ( data.strain ) return data.strain;

    const castingAbility = data.spellcastingAbility ?? fromUuidSync( data.spellcastingAbilityUuid );
    return castingAbility.system.baseRollOptions.strain;
  }

  /** @inheritDoc */
  _prepareTargetDifficulty( data ) {
    if ( data.target ) return data.target;

    const spell = data.spell ?? fromUuidSync( data.spellUuid );
    return {
      base:      spell.system.getDifficulty(),
    };
  }

  // endregion

  // region Rendering

  /** @inheritdoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.spell = await fromUuid( this.spellUuid );
    newContext.spellContentAnchor = createContentAnchor( newContext.spell ).outerHTML;
    newContext.spellcastingAbility = await fromUuid( this.spellcastingAbilityUuid );
    newContext.spellcastingAbilityContentAnchor = createContentAnchor( newContext.spellcastingAbility ).outerHTML;

    return newContext;
  }

  // endregion

}