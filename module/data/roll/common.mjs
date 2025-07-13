import { lowerCaseFirstLetter, sum } from "../../utils.mjs";
import getDice from "../../dice/step-tables.mjs";
import ED4E from "../../config/_module.mjs";
import MappingField from "../fields/mapping-field.mjs";
import FormulaField from "../fields/formula-field.mjs";

import SparseDataModel from "../abstract/sparse-data-model.mjs";

/**
 * @typedef {import('../../dice/ed-roll.mjs').FlavorTemplateData} FlavorTemplateData
 */

/**
 * @typedef { object } RollStepData Data for a roll step.
 * @property { number } base The base step that is used to determine the dice that are rolled.
 * @property { Record<string, number> } modifiers All modifiers that are applied to the base step.
 *                                              Keys are localized labels. Values are the modifier.
 * @property { number } total The final step that is used to determine the dice that are rolled.
 *                            The sum of all modifiers is added to the base value.
 */

/**
 * @typedef { object } RollResourceData Data for a roll resource like karma or devotion.
 * @property { number } pointsUsed How many points of this resource should be consumed after rolling.
 * @property { number } available How many points of this resource are available.
 * @property { number } step The step that is used to determine the dice that are rolled for this resource.
 * @property { string } dice The dice that are rolled for this resource.
 */

/**
 * @typedef { object } RollTargetData Data for the target number of a roll.
 * @property { number } base The base target number.
 * @property { Record<string, number> } modifiers All modifiers that are applied to the base target number.
 *                                             Keys are localized labels. Values are the modifier.
 * @property { number } total The final target number. The sum of all modifiers is added to the base value.
 * @property { boolean } public Whether the target number is shown in chat or hidden.
 */

/**
 * @typedef { object } RollStrainData Data for the strain that is taken after a roll.
 * @property { number } base The base strain that is taken.
 * @property { Record<string, number> } modifiers All modifiers that are applied to the base strain.
 *                                            Keys are localized labels. Values are the modifier.
 * @property { number } total The final strain that is taken. The sum of all modifiers is added to the base value.
 */

/**
 * EdRollOptions for creating an EdRoll instance.
 * @property { RollStepData } step Ever information related to the step of the action, Mods, Bonuses, Mali etc.
 * @property { RollResourceData } karma Available Karma, Karma dice and used karma.
 * @property { RollResourceData } devotion Available Devotions, Devotion die, Devotion die used and used devotion.
 * @property { Record<string, number> } extraDice Extra dice that are added to the roll.
 *                                            Keys are localized labels. Values are the number of dice.
 * @property { RollTargetData } target All information of the targets array. Defenses, number, resistance.
 * @property { RollStrainData } strain How much strain this roll will cost
 * @property { string } chatFlavor The text that is added to the ChatMessage when this call is put to chat.
 * @property { ( 'action' | 'effect' ) } testType The type of roll.
 * @property { string } rollType Type of roll, like
 *                               damageRanged (Effect), damageMelee (Effect), attackRanged, attackMelee,
 *                               ability,
 *                               resistances (Effect), reaction, opposed
 *                               spellCasting, threadWeaving, spellCastingEffect (Effect)
 *                               Initiative (effect), Recovery (Effect), effects (Effect)
 *                               poison
 *                               etc. TODO: complete list
 */
export default class EdRollOptions extends SparseDataModel {

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.RollOptions",
  ];

  /**
   * The type of test that this roll represents.
   * @type {string}
   */
  static TEST_TYPE = "arbitrary";

  /**
   * The type of roll that this represents.
   * @type {string}
   */
  static ROLL_TYPE = "arbitrary";

  // endregion

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      step: new fields.SchemaField(
        {
          base: new fields.NumberField( {
            required: true,
            nullable: false,
            initial:  1,
            min:      1,
            step:     1,
            integer:  true,
          } ),
          modifiers: new MappingField(
            new fields.NumberField( {
              required: true,
              nullable: false,
              initial:  0,
              step:     1,
              integer:  true,
            } ),
            {
              required:        true,
              initialKeysOnly: false,
            },
          ),
          total: new fields.NumberField( {
            required: true,
            nullable: false,
            initial:  this.initTotalStep,
            min:      1,
            step:     1,
            integer:  true,
          } ),
        },
        {
          required: true,
          nullable: false,
        },
      ),
      karma:     this._bonusResource,
      devotion:  this._bonusResource,
      extraDice: new MappingField( new fields.NumberField( {
        required: true,
        nullable: false,
        initial:  1,
        min:      1,
        step:     1,
        integer:  true,
      } ), {
        required:        true,
        initialKeysOnly: false,
      } ),
      target: new fields.SchemaField(
        {
          base: new fields.NumberField( {
            required: true,
            nullable: false,
            initial:  () => game.settings.get( "ed4e", "minimumDifficulty" ),
            min:      0,
            step:     1,
          } ),
          modifiers: new MappingField(
            new fields.NumberField( {
              required: true,
              nullable: true,
              initial:  0,
              min:      0,
              step:     1,
            } ),
            {
              required:        true,
              initialKeysOnly: false,
            },
          ),
          total: new fields.NumberField( {
            required: true,
            nullable: false,
            initial:  this.initTotalTarget,
            min:      0,
            step:     1,
            integer:  true,
          } ),
          public: new fields.BooleanField( {
            required: true,
            nullable: false,
            initial:  true,
          } ),
          tokens: new fields.SetField( new fields.DocumentUUIDField(), {
            required: false,
          } ),
        },
        {
          required: true,
          nullable: true,
        },
      ),
      strain: new fields.SchemaField(
        {
          base: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            initial:  0,
            integer:  true,
          } ),
          modifiers: new MappingField(
            new fields.NumberField( {
              required: true,
              nullable: false,
              initial:  0,
              min:      0,
              step:     1,
              integer:  true,
            } ),
            {
              required:        true,
              initialKeysOnly: false,
            },
          ),
          total: new fields.NumberField( {
            required: true,
            nullable: false,
            initial:  this.initTotalStrain,
            min:      0,
            step:     1,
            integer:  true,
          } ),
        },
        {
          required: true,
          nullable: true,
        },
      ),
      chatFlavor: new fields.StringField( {
        required: true,
        nullable: false,
        blank:    true,
        initial:  "",
      } ),
      rollingActorUuid: new fields.DocumentUUIDField( {
        nullable: true,
      } ),
      testType: new fields.StringField( {
        required: true,
        nullable: false,
        blank:    true,
        initial:  "arbitrary",
        choices:  ED4E.ROLLS.testTypes,
      } ),
      rollType: new fields.StringField( {
        required: false,
        nullable: true,
        blank:    true,
        initial:  "arbitrary",
        choices:  ED4E.ROLLS.rollTypes,
      } ),
      successes: new fields.SchemaField( {
        guaranteed: new fields.NumberField( {
          nullable:  true,
          initial:   null,
          integer:   true,
        } ),
        additionalExtra: new fields.NumberField( {
          nullable:  true,
          initial:   null,
          integer:   true,
        } ),
      }, {
        nullable: true,
        initial:  null,
      } ),
    };
  }

  /**
   * @description Bonus resources to be added globally
   * @type { RollResourceData }
   */
  static get _bonusResource() {
    const fields = foundry.data.fields;
    return new fields.SchemaField(
      {
        pointsUsed: new fields.NumberField( {
          required: true,
          nullable: false,
          initial:  0,
          min:      0,
          step:     1,
          integer:  true,
        } ),
        available: new fields.NumberField( {
          required: true,
          nullable: false,
          initial:  0,
          min:      0,
          step:     1,
          integer:  true,
        } ),
        step: new fields.NumberField( {
          required: true,
          nullable: false,
          initial:  this.initResourceStep,
          min:      1,
          step:     1,
          integer:  true,
        } ),
        dice: new FormulaField( {
          required: true,
          initial:  this.initDiceForStep,
        } ),
      },
      {
        required: true,
        nullable: true,
      },
    );
  }

  /**
   * Creates a new instance of EdRollOptions from the provided data and actor. Subclasses may extend this method.
   * This basic implementation initializes the roll with karma and devotion data derived from the actor.
   * @param {object} data - The data object containing the roll options, see {@link foundry.abstract.DataModel}.
   * @param {ActorEd} actor - The actor from which to derive additional roll options.
   * @param {RollOptions} [options] - Additional options for the roll, see {@link foundry.abstract.DataModel}.
   * @returns {EdRollOptions} A new instance of EdRollOptions initialized with the provided data and actor.
   */
  static fromActor( data, actor, options = {} ) {
    data.karma = {
      pointsUsed: actor.system.karma.useAlways ? 1 : 0,
      available:  actor.system.karma.value,
      step:       actor.system.karma.step
    };
    data.devotion = {
      pointsUsed: data.devotionRequired ? 1: 0,
      available:  actor.system.devotion.value,
      step:       actor.system.devotion.step,
    };
    data.rollingActorUuid = actor.uuid;

    return new this( data, options );
  }

  // region Data Field Initialization

  static initResourceStep( _ ) {
    const parentField = this?.parent?.name;
    return ED4E.resourceDefaultStep[parentField] ?? 4;
  }

  static initTotal( source, attribute, defaultValue ){
    const value = source?.[attribute]?.base ?? source.base ?? defaultValue;
    return value + sum( Object.values( source?.[attribute]?.modifiers ?? {} ) );
  }

  static initTotalStep( source ) {
    return EdRollOptions.initTotal( source, "step", 1 );
  }

  static initTotalStrain( source ) {
    return EdRollOptions.initTotal( source, "strain", 0 );
  }

  static initTotalTarget( source ) {
    return EdRollOptions.initTotal( source, "target", 1 );
  }

  static initDiceForStep( parent ) {
    return getDice( parent.step.total ?? parent.step );
  }

  // endregion

  // region Dynamic Properties

  get totalStep() {
    return this.step.base + sum( Object.values( this.step.modifiers ) );
  }

  get totalTarget() {
    if ( !this.target ) return null;
    return Math.max(
      this.target.base + sum( Object.values( this.target.modifiers ) ),
      game.settings.get( "ed4e", "minimumDifficulty" ),
    );
  }

  // endregion

  // region Source Lifecycle

  /** @inheritDoc */
  _initializeSource( data, options = {} ) {
    data.step ??= this._prepareStepData( data );
    data.target ??= this._prepareTargetDifficulty( data );
    data.strain ??= this._prepareStrainData( data );
    data.testType ??= this.constructor.TEST_TYPE;
    data.rollType ??= this.constructor.ROLL_TYPE;

    if ( data[ "karma.step" ] || data.karma?.step ) {
      data.karma.dice = getDice( data[ "karma.step" ] ?? data.karma?.step );
    }
    if ( data[ "devotion.step" ] || data.devotion?.step ) {
      data.devotion.dice = getDice( data[ "devotion.step" ] ?? data.devotion?.step );
    }

    return super._initializeSource( data, options );
  }

  /** @inheritDoc */
  updateSource( changes = {}, options = {} ) {
    const resourceUpdates = {};
    if ( changes[ "karma.step" ] ) {
      resourceUpdates["karma.dice"] = getDice( changes[ "karma.step" ] );
    }
    if ( changes[ "devotion.step" ] ) {
      resourceUpdates["devotion.dice"] = getDice( changes[ "devotion.step" ] );
    }

    const updates = super.updateSource(
      foundry.utils.mergeObject( changes, resourceUpdates, ),
      options
    );
    updates.step ??= {};
    updates.step.total = this.step.total = this.totalStep;
    if ( updates.target?.total ) updates.target.total = this.target.total = this.totalTarget;
    return super.updateSource( updates, options );
  }

  // endregion

  // region Data Initialization

  /**
   * Generates the chat flavor text for this roll. The localized key is 'ED.Chat.Flavor.' + the
   * camelCase class name.
   * @returns {string} The formatted chat flavor text for this roll.
   */
  _getChatFlavor() {
    return game.i18n.format(
      `ED.Chat.Flavor.${lowerCaseFirstLetter( this.constructor.name )}`,
      this._getChatFlavorData( this.source ),
    );
  }

  /**
   * Generates the data object for the `format` method call of the chat flavor text.
   * @returns {object} The data object containing the data for the call to {@link Localization.format}.
   */
  _getChatFlavorData() {
    return {};
  }

  /**
   * Used when initializing this data model. Retrieves step data based on the provided input data.
   * @param {object} data The input data object containing relevant ability information.
   * @returns {RollStepData} The step data object containing the base step and modifiers, if any.
   */
  _prepareStepData( data ) {
    return {};
  }

  /**
   * Used when initializing this data model. Prepares strain data based on the provided input data.
   * @param {object} data - The input data object containing relevant information for strain calculation.
   * @returns {RollStrainData|null} The strain data object containing the base strain and any modifiers or null if not applicable.
   */
  _prepareStrainData( data ) {
    return data.strain ?? null;
  }

  /**
   * Used when initializing this data model. Calculates the target difficulty for a roll based on the input data.
   * @param {object} data - The data object with which this model is initialized.
   * @returns {RollTargetData|null} The target difficulty containing base and modifiers or null if not applicable (e.g. for effect tests).
   */
  _prepareTargetDifficulty( data ) {
    return data.target ?? null;
  }

  // endregion

  // region Methods

  getModifierSum( fieldName ) {
    const field = this[fieldName];
    if ( !field || !field.modifiers ) return 0;
    return sum( Object.values( field.modifiers ) );
  }

  // endregion

  // region Rendering

  /**
   * Prepares data for rendering flavor templates in roll chat messages.
   * Subclasses of EdRollOptions can override this method to add roll-type specific data
   * to the base FlavorTemplateData.
   * @param {object} context - Initial template data containing base roll information
   * @returns {Promise<FlavorTemplateData>} Enhanced template data for the specific roll type
   */
  async getFlavorTemplateData( context ) {
    return {
      ...context,
      customFlavor: context.customFlavor || this._getChatFlavor(),
    };
  }

  // endregion

}