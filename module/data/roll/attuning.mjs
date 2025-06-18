import EdRollOptions from "./common.mjs";
import { ED4E } from "../../../earthdawn4e.mjs";
import { createContentAnchor } from "../../utils.mjs";


export default class AttuningRollOptions extends EdRollOptions {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.AttuningRollOptions",
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      attuningType: new fields.StringField( {
        required: true,
        choices:  ED4E.attuningType,
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
    } );
  }

  /** @inheritDoc */
  static fromActor( data, actor, options = {} ) {
    const modifiedData = {
      ...data,
      testType: "action",
      rollType: "attuning",
    };
    return super.fromActor( modifiedData, actor, options );
  }

  /** @inheritDoc */
  _initializeSource( data, options={} ) {
    data.step ??= this._getStepData( data );
    data.target ??= this._getTargetDifficulty( data );
    data.strain ??= {
      base: data.attuningType === "matrixOnTheFly" ? 1 : 0,
    };
    return super._initializeSource( data, options );
  }

  /**
   * Retrieves step data based on the provided input data.
   * @param {object} data The input data object containing relevant ability information.
   * @param {string} data.attuningAbility The UUID of the ability with which to attune, "patterncraft" for grimoire,
   *                                      "thread weaving" for matrix.
   * @returns {object} An object containing the base rank and empty modifiers for the ability.
   */
  _getStepData( data ) {
    const ability = fromUuidSync( data.attuningAbility );
    return {
      base:      ability.system.rankFinal,
      modifiers: {},
    };
  }

  /**
   * Calculates the target difficulty for an attuning roll.
   * @param {object} data - The data object containing spell information.
   * @param {Array<string>} data.spells - Array of spell UUIDs to be attuned.
   * @returns {object} The target difficulty containing base and modifiers.
   */
  _getTargetDifficulty( data ) {
    return  {
      base:      0,
      modifiers: data.spellsToAttune?.reduce( ( acc, spellUuid ) => {
        const spell = fromUuidSync( spellUuid );
        if ( spell ) acc[spell.name] = spell.system?.spellDifficulty?.reattune;
        return acc;
      }, {} ),
    };
  }

  async _getChatFlavor() {
    return game.i18n.format(
      "ED.Chat.Flavor.AttuningRollOptions",
      {
        actor:           createContentAnchor( await fromUuid( this.rollingActorUuid ) ).outerHTML,
        attuningItem:    ED4E.attuningType[ this.attuningType ],
        attuningAbility: createContentAnchor( await fromUuid( this.attuningAbility ) ).outerHTML,
      },
    );
  }

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

    newContext.customFlavor ||= await this._getChatFlavor();
    newContext.spellsToAttune = ( await this.getSpellItems() ).filter( spell => !!spell );

    return newContext;
  }

  // endregion

}