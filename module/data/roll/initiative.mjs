import EdRollOptions from "./common.mjs";

import { createContentAnchor } from "../../helpers/formatting.mjs";

/**
 * @import { InitiativeRollOptionsSystemData } from "./_types.mjs";
 */

/**
 * Roll options for initiative rolls.
 * @augments {EdRollOptions<InitiativeRollOptionsSystemData>}
 * @see {@link InitiativeRollOptionsSystemData} The system data model for initiative roll options.
 */
export default class InitiativeRollOptions extends EdRollOptions {

  // region Schema

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      replacementEffect: new fields.DocumentUUIDField( {
        nullable: true,
        initial:  null,
        type:     "Item",
        embedded: true,
      } ),
      increaseAbilities: new fields.SetField( new fields.DocumentUUIDField( {
        nullable: true,
        initial:  null,
        type:     "Item",
        embedded: true,
      } ), {} ),
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.InitiativeRollOptions",
  ];

  /** @inheritdoc */
  static TEST_TYPE = "effect";

  /** @inheritdoc */
  static ROLL_TYPE = "initiative";

  /** @inheritdoc */
  static GLOBAL_MODIFIERS = [
    "allEffects",
    ...super.GLOBAL_MODIFIERS,
  ];

  // endregion

  // region Static Methods

  /** @inheritDoc */
  static fromData( data, options = {} ) {
    return /** @type { InitiativeRollOptions } */ super.fromData( data, options );
  }

  /** @inheritDoc */
  static fromActor( data, actor, options = {} ) {
    return /** @type { InitiativeRollOptions } */ super.fromActor( data, actor, options );
  }

  // endregion

  // region Rendering

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );
    newContext.replacementEffect = await fromUuid( this.replacementEffect );
    newContext.replacementEffectContentLink = newContext.replacementEffect
      ? createContentAnchor( newContext.replacementEffect ).outerHTML
      : null;
    newContext.increaseAbilities = await Promise.all(
      this.increaseAbilities.map( uuid => fromUuid( uuid ) )
    );
    newContext.increaseAbilitiesContentLinks = newContext.increaseAbilities.map( ability =>
      createContentAnchor( ability ).outerHTML
    );
    return newContext;
  }

  // endregion

}