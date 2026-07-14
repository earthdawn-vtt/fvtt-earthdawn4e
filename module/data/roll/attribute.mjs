import EdRollOptions from "./common.mjs";
import { createContentAnchor } from "../../helpers/formatting.mjs";
import * as ACTORS from "../../config/actors.mjs";

/**
 * @import { AttributeRollOptionsSystemData, AttributeRollOptionsInitializationData } from "./_types.mjs";
 */

/**
 * Roll options for attribute rolls.
 * @augments {EdRollOptions<AttributeRollOptionsSystemData>}
 * @see {@link AttributeRollOptionsSystemData} The system data model for attribute roll options.
 * @see {@link AttributeRollOptionsInitializationData} The initialization data for attribute roll options.
 */
export default class AttributeRollOptions extends EdRollOptions {

  // region Schema

  /** @inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      attribute:      new fields.StringField(),
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.AttributeRollOptions",
  ];

  /** @inheritdoc */
  static TEST_TYPE = "action";

  /** @inheritdoc */
  static ROLL_TYPE = "attribute";

  /** @inheritdoc */
  static GLOBAL_MODIFIERS = [
    ...super.GLOBAL_MODIFIERS,
    "allActions",
  ];

  // endregion

  // region Static Methods

  /**
   * @inheritdoc
   * @returns { AttributeRollOptions } A new instance of AttributeRollOptions.
   */
  static fromData( data, options = {} ) {
    return /** @type { AttributeRollOptions } */ ( super.fromData( data, options ) );
  }

  /**
   * @inheritdoc
   * @returns { AttributeRollOptions } A new instance of AttributeRollOptions.
   */
  static fromActor( data, actor, options = {} ) {
    return /** @type { AttributeRollOptions } */ ( super.fromActor( data, actor, options ) );
  }

  // endregion

  // region Data Initialization

  /** @inheritDoc */
  static _prepareStepData( data ) {
    if ( data.step ) return data.step;

    const actor = fromUuidSync( data.rollingActorUuid );
    const attributeStep = actor.system.attributes[ data.attribute ].step;

    return {
      base:      attributeStep,
      modifiers: {},
    };
  }

  /** @inheritDoc */
  _getChatFlavorData() {
    return {
      attribute:   ACTORS.attributes[ this.attribute ].label,
      actor:       createContentAnchor( fromUuidSync( this.rollingActorUuid ) ).outerHTML,
    };
  }

  // endregion

  // region Rendering

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.rollingActor = await fromUuid( this.rollingActorUuid );
    newContext.rollingActorTokenDocument = await context.rollingActor?.getTokenDocument();

    return newContext;
  }

  // endregion

}