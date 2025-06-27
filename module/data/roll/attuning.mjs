import EdRollOptions from "./common.mjs";
import { ED4E } from "../../../earthdawn4e.mjs";
import { createContentAnchor } from "../../utils.mjs";


export default class AttuningRollOptions extends EdRollOptions {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.AttuningRollOptions",
  ];

  /** @inheritdoc */
  static TEST_TYPE = "action";

  /** @inheritdoc */
  static ROLL_TYPE = "attuning";

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
      grimoirePenalty: new fields.BooleanField( {
        initial:  false,
      } ),
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
  _prepareStepData( data ) {
    const ability = fromUuidSync( data.attuningAbility );
    const stepData = {
      base:      ability.system.rankFinal,
    };
    stepData.modifiers = ( data.attuningType === "grimoire" && data.grimoirePenalty )
      ? { [ game.i18n.localize( "ED.Rolls.Modifiers.grimoirePenalty" ) ]: -2 }
      : {};
    return stepData;
  }

  /** @inheritDoc */
  _prepareStrainData( data ) {
    return {
      base:      data.attuningType === "matrixOnTheFly" ? 1 : 0,
      modifiers: {},
    };
  }

  /** @inheritDoc */
  _prepareTargetDifficulty( data ) {
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
      attuningItem:    ED4E.attuningType[ this.attuningType ],
      attuningAbility: createContentAnchor( fromUuidSync( this.attuningAbility ) ).outerHTML,
    };
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

    newContext.spellsToAttune = ( await this.getSpellItems() ).filter( spell => !!spell );

    return newContext;
  }

  // endregion

}