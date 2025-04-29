import EdRollOptions from "./common.mjs";
import { ED4E } from "../../../earthdawn4e.mjs";


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
        choices: ED4E.attuningType,
      } ),
      spellsToAttune: new fields.SetField(
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
    data.target ??= this._getTargetDifficulty( data );
    return super._initializeSource( data, options );
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
        acc[spell.name] = spell.system?.spellDifficulty?.reattune;
        return acc;
      }, {} ),
    };
  }

  // region Rendering

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.spellsToAttune = await Promise.all( this.spellsToAttune.map( async spell => await fromUuid( spell ) ) );

    return newContext;
  }

  // endregion

}