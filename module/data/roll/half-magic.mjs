import EdRollOptions from "./common.mjs";
import { createContentAnchor } from "../../helpers/formatting.mjs";
import * as ACTORS from "../../config/actors.mjs";

/**
 * @import { HalfMagicRollOptionsSystemData, HalfMagicRollOptionsInitializationData } from "./_types.mjs";
 */

/**
 * Roll options for half-magic rolls.
 * @augments {EdRollOptions<HalfMagicRollOptionsSystemData>}
 * @see {@link HalfMagicRollOptionsSystemData} The system data model for half-magic roll options.
 * @see {@link HalfMagicRollOptionsInitializationData} The initialization data for half-magic roll options.
 */
export default class HalfMagicRollOptions extends EdRollOptions {

  // region Schema

  /** @inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      attribute:      new fields.StringField(),
      disciplineUuid: new fields.DocumentUUIDField( {
        type:     "Item",
        embedded: true,
      } ),
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.HalfMagicRollOptions",
  ];

  /** @inheritdoc */
  static TEST_TYPE = "action";

  /** @inheritdoc */
  static ROLL_TYPE = "halfMagic";

  /** @inheritdoc */
  static GLOBAL_MODIFIERS = [
    ...super.GLOBAL_MODIFIERS,
    "allActions",
  ];

  // endregion

  // region Static Methods

  /**
   * @inheritdoc
   *
   * @returns { HalfMagicRollOptions } A new instance of HalfMagicRollOptions.
   */
  static fromData( data, options = {} ) {
    if ( data.discipline && !data.disciplineUuid ) data.disciplineUuid = data.discipline.uuid;

    return /** @type { HalfMagicRollOptions } */ ( super.fromData( data, options ) );
  }

  /**
   * @inheritdoc
   * @returns { HalfMagicRollOptions } A new instance of HalfMagicRollOptions.
   */
  static fromActor( data, actor, options = {} ) {
    return /** @type { HalfMagicRollOptions } */ ( super.fromActor( data, actor, options ) );
  }

  // endregion

  // region Data Initialization

  /** @inheritDoc */
  static _prepareStepData( data ) {
    if ( data.step ) return data.step;

    const actor = fromUuidSync( data.rollingActorUuid );
    const discipline = data.discipline ?? fromUuidSync( data.disciplineUuid );
    const attributeStep = actor.system.attributes[ data.attribute ].step;

    return {
      base:      attributeStep + discipline.system.level,
      modifiers: {},
    };
  }

  /** @inheritDoc */
  _getChatFlavorData() {
    return {
      attribute:   ACTORS.attributes[ this.attribute ].label,
      actor:       createContentAnchor( fromUuidSync( this.rollingActorUuid ) ).outerHTML,
      discipline:  createContentAnchor( fromUuidSync( this.disciplineUuid ) ).outerHTML,
      step:        this.step.total,
    };
  }

  // endregion

  // region Rendering

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.discipline = /** @type {ItemEd} */ await fromUuid( this.disciplineUuid );
    newContext.disciplineContentAnchor = createContentAnchor( newContext.discipline )?.outerHTML;

    newContext.rollingActor = await fromUuid( this.rollingActorUuid );
    newContext.rollingActorTokenDocument = await context.rollingActor?.getTokenDocument();

    return newContext;
  }

  // endregion

}