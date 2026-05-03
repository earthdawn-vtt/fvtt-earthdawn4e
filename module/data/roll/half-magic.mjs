import EdRollOptions from "./common.mjs";
import { createContentAnchor } from "../../helpers/formatting.mjs";
import * as ACTORS from "../../config/actors.mjs";

/**
 * @typedef { object } HalfMagicRollOptionsInitializationData
 * @augments { EdRollOptionsInitializationData }
 * @property {string} attribute The attribute to use for the roll. Must be one of
 * the keys listed in {@link attributes}.
 * @property { ItemEd } [discipline] The discipline for which to roll half-magic.
 * Can be omitted if `disciplineUuid` is provided.
 * @property { string } [disciplineUuid] The UUID of the discipline for which to roll half-magic.
 * Can be omitted if `discipline` is provided.
 */

/**
 * Roll options for half-magic rolls.
 * @augments { EdRollOptions }
 * @property {string} attribute The attribute to use for the roll.
 * @property { string } disciplineUuid The UUID of the discipline for which to roll half-magic.
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
  _getChatFlavor() {
    const discipline = fromUuidSync( this.disciplineUuid );
    return discipline.system.summary?.value ?? super._getChatFlavor();
  }

  /** @inheritDoc */
  _getChatFlavorData() {
    const actor = fromUuidSync( this.rollingActorUuid );
    return {
      attribute:   ACTORS.attributes[ this.attribute ].label,
      actor:       actor.name,
      sourceActor: createContentAnchor( actor ).outerHTML,
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