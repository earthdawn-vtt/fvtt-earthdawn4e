import EdRollOptions from "./common.mjs";
import { createContentAnchor } from "../../utils.mjs";
import { MAGIC } from "../../config/_module.mjs";

/**
 * @typedef { object } EdSpellcastingRollOptionsInitializationData
 * @augments { EdRollOptionsInitializationData }
 * @property { ItemEd } [spell] The spell being cast.
 * Can be omitted if `spellUuid` in {@link SpellcastingRollOptions} is provided.
 * @property { ItemEd } [spellcastingAbility] The ability used for spellcasting.
 * Can be omitted if `spellcastingAbilityUuid` in {@link SpellcastingRollOptions} is provided.
 * @property { ItemEd } [grimoire] The grimoire item, if a grimoire is used to cast the spell.
 */

/**
 * Roll options for spellcasting.
 * @augments { EdRollOptions }
 * @property { string } spellUuid The UUID of the spell being cast.
 * @property { string } spellcastingAbilityUuid The UUID of the ability used for spellcasting.
 */
export default class SpellcastingRollOptions extends EdRollOptions {

  // region Static Properties

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

  // endregion

  // region Static Methods

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

  /**
   * @inheritDoc
   * @param { EdSpellcastingRollOptionsInitializationData & Partial<SpellcastingRollOptions> } data The data to initialize the roll options with.
   */
  static fromData( data, options = {} ) {
    data.spellcastingAbilityUuid ??= data.spellcastingAbility?.uuid;
    data.spellUuid ??= data.spell?.uuid;
    if ( data.grimoire?.system.grimoireBelongsTo?.( data.rollingActorUuid ) ) {
      data.successes ??= {};
      data.successes.additionalExtra ??= 0;
      data.successes.additionalExtra += MAGIC.grimoireModifiers.ownedExtraSuccess;
    }

    return /** @type { SpellcastingRollOptions } */ super.fromData( data, options );
  }

  /**
   * @inheritDoc
   * @param { EdSpellcastingRollOptionsInitializationData & Partial<SpellcastingRollOptions> } data The data to initialize the roll options with.
   */
  static fromActor( data, actor, options = {} ) {
    return /** @type { SpellcastingRollOptions } */ super.fromActor( data, actor, options );
  }

  // endregion

  // region Data Initialization

  /** @inheritDoc */
  _getChatFlavorData() {
    return {
      sourceActor:         createContentAnchor( fromUuidSync( this.rollingActorUuid ) ).outerHTML,
      spell:               createContentAnchor( fromUuidSync( this.spellUuid ) ).outerHTML,
      spellcastingAbility: createContentAnchor( fromUuidSync( this.spellcastingAbilityUuid ) ).outerHTML,
    };
  }

  /** @inheritDoc */
  static _prepareStepData( data ) {
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
  static _prepareStrainData( data ) {
    if ( data.strain ) return data.strain;

    const castingAbility = data.spellcastingAbility ?? fromUuidSync( data.spellcastingAbilityUuid );
    return castingAbility.system.baseRollOptions.strain;
  }

  /** @inheritDoc */
  static _prepareTargetDifficulty( data ) {
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
    newContext.itemForEffects = newContext.spell;
    newContext.spellContentAnchor = createContentAnchor( newContext.spell ).outerHTML;
    newContext.spellcastingAbility = await fromUuid( this.spellcastingAbilityUuid );
    newContext.spellcastingAbilityContentAnchor = createContentAnchor( newContext.spellcastingAbility ).outerHTML;

    return newContext;
  }

  // endregion

}