import EdRollOptions from "./common.mjs";

/**
 * Roll options for ability rolls.
 * @augments { EdRollOptions }
 * @property { string } abilityUuid The UUID of the ability being rolled.
 */
export default class AbilityRollOptions extends EdRollOptions {

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.AbilityRollOptions",
  ];

  /** @inheritdoc */
  static TEST_TYPE = "action";

  /** @inheritdoc */
  static ROLL_TYPE = "ability";

  /** @inheritdoc */
  static GLOBAL_MODIFIERS = [
    "allActions",
    ...super.GLOBAL_MODIFIERS,
  ];

  // endregion

  // region Static Methods

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      abilityUuid: new fields.DocumentUUIDField( {
        type:     "Item",
        embedded: true,
      } ),
    } );
  }

  /**
   * @inheritdoc
   * @returns { AbilityRollOptions } A new instance of AbilityRollOptions.
   */
  static fromData( data, options = {} ) {
    return /** @type { AbilityRollOptions } */ super.fromData( data, options );
  }

  /**
   * @inheritDoc
   * @returns { AbilityRollOptions } A new instance of AbilityRollOptions.
   */
  static fromActor( data, actor, options = {} ) {
    return /** @type { AbilityRollOptions } */ super.fromActor( data, actor, options );
  }

  // endregion

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.ability = await fromUuid( this.abilityUuid );
    newContext.itemForEffects = newContext.ability;
    newContext.rollingActor = await fromUuid( this.rollingActorUuid );
    newContext.rollingActorTokenDocument = await context.rollingActor?.getTokenDocument();

    return newContext;
  }

}