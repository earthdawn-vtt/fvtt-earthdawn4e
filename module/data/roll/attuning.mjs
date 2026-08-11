import EdRollOptions from "./common.mjs";
import * as MAGIC from "../../config/magic.mjs";
import { createContentAnchor } from "../../helpers/formatting.mjs";

/**
 * @import { AttuningRollOptionsSystemData } from "./_types.mjs";
 */

/**
 * Roll options for attuning spells to matrices or grimoires.
 * @augments {EdRollOptions<AttuningRollOptionsSystemData>}
 * @see {@link AttuningRollOptionsSystemData} The system data model for attuning roll options.
 */
export default class AttuningRollOptions extends EdRollOptions {

  // region Schema

  /** @inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      attuningType: new fields.StringField( {
        required: true,
        choices:  MAGIC.attuningType,
      } ),
      // thread weaving for matrices, patterncraft for grimoire
      attuningAbility: new fields.DocumentUUIDField( {
        required: true,
        type:     "Item",
        embedded: true,
      } ),
      spellsToAttune:  new fields.SetField(
        new fields.DocumentUUIDField( {
          type:     "Item",
        } ),
        {
          required: true,
          min:      1,
        },
      ),
      grimoirePenalty: new fields.BooleanField( {
        initial:  false,
      } ),
      itemsToAttuneTo: new fields.SetField(
        new fields.DocumentUUIDField( {
          type:     "Item",
        } ),
        {
          required: true,
          min:      1,
        },
      ),
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.AttuningRollOptions",
  ];

  /** @inheritdoc */
  static TEST_TYPE = "action";

  /** @inheritdoc */
  static ROLL_TYPE = "attuning";

  // endregion

  // region Static Methods

  /** @inheritDoc */
  static fromActor( data, actor, options = {} ) {
    return /** @type { AttuningRollOptions } */ super.fromActor( data, actor, options );
  }

  /** @inheritDoc */
  static fromData( data, options = {} ) {
    return /** @type { AttuningRollOptions } */ super.fromData( data, options );
  }

  // endregion

  // region Data Initialization

  /** @inheritDoc */
  static _prepareStepData( data ) {
    const ability = fromUuidSync( data.attuningAbility );
    const stepData = {
      base:      ability.system.rankFinal,
    };
    stepData.modifiers = ( data.attuningType === "grimoire" && data.grimoirePenalty )
      ? { [ _loc( "ED.Rolls.Modifiers.grimoirePenalty" ) ]: -2 }
      : {};
    return stepData;
  }

  /** @inheritDoc */
  static _prepareStrainData( data ) {
    return {
      base:      data.attuningType === "matrixOnTheFly" ? 1 : 0,
      modifiers: {},
    };
  }

  /** @inheritDoc */
  static _prepareTargetDifficulty( data ) {
    return  {
      base:      0,
      modifiers: data.spellsToAttune?.reduce( ( acc, spellUuid ) => {
        const spell = fromUuidSync( spellUuid );
        if ( spell ) acc[spell.name] = spell.system?.spellDifficulty?.reattune;
        return acc;
      }, {} ),
    };
  }

  /** @inheritDoc */
  _getChatFlavorData() {
    return {
      sourceActor:     createContentAnchor( fromUuidSync( this.rollingActorUuid ) ).outerHTML,
      attuningItem:    MAGIC.attuningType[ this.attuningType ],
      attuningAbility: createContentAnchor( fromUuidSync( this.attuningAbility ) ).outerHTML,
    };
  }

  // endregion

  /**
   * Get the spell items that will be attuned.
   * @returns {Promise<Array<ItemEd>>} A promise that resolves to an array of spell items.
   */
  async getSpellItems() {
    return Promise.all( this.spellsToAttune.map( async spell => await fromUuid( spell ) ) );
  }

  // region Rendering

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.spellsToAttune = ( await this.getSpellItems() ).filter( spell => !!spell );
    newContext.spellsToAttuneContentAnchors = newContext.spellsToAttune.map( spell =>
      createContentAnchor( spell ).outerHTML
    );
    newContext.attuningTypeLabel = MAGIC.attuningType[ this.attuningType ];
    newContext.attuningAbility = await fromUuid( this.attuningAbility );
    newContext.attuningAbilityContentAnchor = createContentAnchor( newContext.attuningAbility ).outerHTML;
    newContext.itemsToAttuneTo = await Promise.all( this.itemsToAttuneTo.map( itemUuid => fromUuid( itemUuid ) ) );
    newContext.itemsToAttuneToContentAnchor = newContext.itemsToAttuneTo.map( item =>
      createContentAnchor( item ).outerHTML
    );


    return newContext;
  }

  // endregion

}