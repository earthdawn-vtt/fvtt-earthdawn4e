import { lowerCaseFirstLetter, sum } from "../../utils.mjs";
import getDice from "../../dice/step-tables.mjs";
import ED4E, { EFFECTS } from "../../config/_module.mjs";
import MappingField from "../fields/mapping-field.mjs";
import FormulaField from "../fields/formula-field.mjs";

import SparseDataModel from "../abstract/sparse-data-model.mjs";

/**
 * @typedef { object } EdRollOptionsInitializationData
 * @property { RollStepData } [step] The step data for the roll. Can be omitted if to be initialized automatically.
 * @property { RollTargetData } [target] The target data for the roll. Can be omitted if to be initialized automatically.
 * @property { RollStrainData } [strain] The strain data for the roll. Can be omitted if to be initialized automatically.
 * @property { RollResourceData } [karma] The karma data for the roll. Can be omitted if to initialize to default.
 * @property { RollResourceData } [devotion] The devotion data for the roll. Can be omitted to initialize to default.
 * @property { Record<string, number> } [extraDice] Extra dice that are added to the roll, see {@link EdRollOptions.extraDice}.
 */

/**
 * @typedef {import('../../dice/ed-roll.mjs').FlavorTemplateData} FlavorTemplateData
 */

/**
 * @typedef {Record<string, number>} RollModifiers
 * @description A collection of named modifiers applied to rolls.
 * Keys are localized label describing the source of the modifier (e.g., "Wounds", "Karma Bonus").
 * Values are numeric modifier value that will be applied to the roll (positive for bonuses, negative for penalties).
 * @example
 * // Example RollModifiers object:
 * {
 *   "Wounds": -2,
 *   "Talent Bonus": 3,
 *   "Situational Penalty": -1
 * }
 */

/**
 * @typedef { object } RollStepData
 * @description Data for a roll step.
 * @property { number } base The base step that is used to determine the dice that are rolled.
 * @property { RollModifiers } [modifiers] All modifiers that are applied to the base step.
 * @property { number } [total] The final step that is used to determine the dice that are rolled.
 *                            The sum of all modifiers is added to the base value.
 */

/**
 * @typedef { object } RollResourceData
 * @description Data for a roll resource like karma or devotion.
 * @property { number } pointsUsed How many points of this resource should be consumed after rolling.
 * @property { number } available How many points of this resource are available.
 * @property { number } step The step that is used to determine the dice that are rolled for this resource.
 * @property { string } dice The dice that are rolled for this resource.
 */

/**
 * @typedef { object } RollTargetData
 * @description Data for the target number of a roll.
 * @property { number } base The base target number.
 * @property { RollModifiers } [modifiers] All modifiers that are applied to the base target number.
 * @property { number } [total] The final target number. The sum of all modifiers is added to the base value.
 * @property { boolean } [public] Whether the target number is shown in chat or hidden.
 */

/**
 * @typedef { object } RollStrainData
 * @description Data for the strain that is taken after a roll.
 * @property { number } base The base strain that is taken.
 * @property { RollModifiers } [modifiers] All modifiers that are applied to the base strain.
 * @property { number } [total] The final strain that is taken. The sum of all modifiers is added to the base value.
 */

/**
 * EdRollOptions Options for creating an {@link EdRoll} instance.
 * If not provided, values for `step`, `target`, and `strain` will be initialized to their automatically.
 * This should be overridden by subclasses to provide automation. This class only provides the default values.
 * @property { RollStepData } step Ever information related to the step of the action, Mods, Bonuses, Mali etc.
 * @property { RollResourceData | null } karma Available Karma, Karma dice and used karma.
 * @property { RollResourceData | null } devotion Available Devotions, Devotion die, Devotion die used and used devotion.
 * @property { Record<string, number> } extraDice Extra dice that are added to the roll.
 *                                            Keys are localized labels. Values are the number of dice.
 * @property { RollTargetData | null } target All information of the targets array. Defenses, number, resistance.
 * @property { RollStrainData | null } strain How much strain this roll will cost
 * @property { string } [chatFlavor=""] The text that is added to the ChatMessage when this call is put to chat.
 * @property { string | null } [rollingActorUuid=null] The UUID of the actor performing the roll.
 * @property { ( 'action' | 'effect' | 'arbitrary' ) } testType The type of the test. See {@link module:config~ROLLS~testTypes}.
 * @property { string } rollType The type of the roll. See {@link module:config~ROLLS~rollTypes}.
 * @property { { guaranteed: number | null, additionalExtra: number | null } | null } successes
 *           Predefined successes for this roll. `guaranteed` are successes that are always counted.
 *           `additionalExtra` are successes that are only counted if extra successes are rolled.
 * @property { boolean } _dummy Whether this roll is a dummy roll that has no mechanical effect or meaningful content. It
 *                             does not consume resources, does not apply strain, has no meaningful result. Can be used
 *                             to simulate rolls for chat messages or other non-mechanical purposes.
 */
export default class EdRollOptions extends SparseDataModel {

  // region Schema

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
      _dummy: new fields.BooleanField( {
        required: true,
        nullable: false,
        initial:  false,
      } ),
    };
  }

  // endregion

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

  /**
   * The global bonuses that are applied to the step of all rolls of this type.
   * @type {[string]}
   */
  static GLOBAL_MODIFIERS = [
    "allTests",
  ];

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

  // endregion

  // region Static Methods

  /**
   * Creates a new instance of EdRollOptions from the provided data and actor. Subclasses may extend this method.
   * This basic implementation initializes the roll with karma and devotion data derived from the actor.
   * @param { EdRollOptionsInitializationData & Partial<EdRollOptions> } data - The data to initialize the roll options with.
   * @param { ActorEd } actor - The actor from which to derive additional roll options.
   * @param { DataModelConstructionContext } [options] - Additional options for the data model, see {@link foundry.abstract.DataModel}.
   * @returns { EdRollOptions } A new instance of EdRollOptions initialized with the provided data and actor.
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

    return this.fromData( data, options );
  }

  /**
   * Creates a new instance of EdRollOptions. It uses the provided data to automatically initialize
   * step, target, and strain data, if possible.
   * @param { EdRollOptionsInitializationData & Partial<EdRollOptions> } data The data object containing the roll options and/or
   * additional data for automatic initialization.
   * @param { DataModelConstructionContext } [options] Additional options for the data model, see {@link foundry.abstract.DataModel}.
   * @returns { EdRollOptions } A new instance of EdRollOptions initialized with the provided data.
   */
  static fromData( data, options = {} ) {
    data.step ??= this._prepareStepData( data );
    data.target ??= this._prepareTargetDifficulty( data );
    data.strain ??= this._prepareStrainData( data );

    return new this( data, options );
  }

  /**
   * Calculates the total value from the provided step data by summing the base value and all modifiers.
   * @param { RollStepData } stepData The step data containing the base value and modifiers.
   * @returns { number } The total calculated from the base and modifiers.
   */
  static getTotalFromStepData( stepData ) {
    return ( stepData.base ?? 0 ) + sum( Object.values( stepData.modifiers ?? {} ) );
  }

  /**
   * Calculates the total value from the provided target data by summing the base value and all modifiers.
   * @param { RollTargetData } targetData The target data containing the base value and modifiers.
   * @returns {number} The total calculated from the base and modifiers, constrained by the minimum difficulty setting.
   */
  static getTotalFromTargetData( targetData ) {
    return Math.max(
      ( targetData.base ?? 0 ) + sum( Object.values( targetData.modifiers ?? {} ) ),
      game.settings.get( "ed4e", "minimumDifficulty" ),
    );
  }

  /**
   * Calculates the total value from the provided strain data by summing the base value and all modifiers.
   * @param { RollStrainData } strainData The strain data containing the base value and modifiers.
   * @returns { number } The total calculated from the base and modifiers.
   */
  static getTotalFromStrainData( strainData ) {
    return ( strainData.base ?? 0 ) + sum( Object.values( strainData.modifiers ?? {} ) );
  }

  // endregion

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
    return Math.max(
      EdRollOptions.initTotal( source, "step", 1 ),
      1,
    );
  }

  static initTotalStrain( source ) {
    return Math.max(
      EdRollOptions.initTotal( source, "strain", 0 ),
      0,
    );
  }

  static initTotalTarget( source ) {
    return Math.max(
      EdRollOptions.initTotal( source, "target", 1 ),
      1,
    );
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
    const modifiedStepData = this._applyGlobalStepModifiers( data );
    if ( modifiedStepData ) data.step = modifiedStepData;

    data.testType ??= this.constructor.TEST_TYPE;
    data.rollType ??= this.constructor.ROLL_TYPE;

    if ( data[ "karma.step" ] || data.karma?.step ) {
      data.karma.dice = getDice( data[ "karma.step" ] ?? data.karma?.step );
    }
    if ( data[ "devotion.step" ] || data.devotion?.step ) {
      data.devotion.dice = getDice( data[ "devotion.step" ] ?? data.devotion?.step );
    }

    this._initializeTotals( data );

    return super._initializeSource( data, options );
  }

  _initializeTotals( data ) {
    if ( data.step && !data.step.total ) {
      data.step.total = this.constructor.getTotalFromStepData( data.step );
    }
    if ( data.target && !data.target.total ) {
      data.target.total = this.constructor.getTotalFromTargetData( data.target );
    }
    if ( data.strain && !data.strain.total ) {
      data.strain.total = this.constructor.getTotalFromStrainData( data.strain );
    }
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

    this._updateTotalStep( updates );
    this._updateTotalTarget( updates );

    return super.updateSource( updates, options );
  }

  _updateTotalStep( updates ) {
    updates.step ??= {};
    updates.step.total = this.step.total = this.totalStep;
    return updates;
  }

  _updateTotalTarget( updates ) {
    if ( updates.target && !updates.target.total ) updates.target.total = this.target.total = this.totalTarget;
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
   * @param {EdRollOptionsInitializationData} data The input data object containing relevant ability information.
   * @returns {RollStepData} The step data object containing the base step and modifiers, if any.
   */
  static _prepareStepData( data ) {
    return data.step ?? {};
  }

  /**
   * Used when initializing this data model. Prepares strain data based on the provided input data.
   * @param {EdRollOptionsInitializationData} data - The input data object containing relevant information for strain calculation.
   * @returns {RollStrainData|null} The strain data object containing the base strain and any modifiers or null if not applicable.
   */
  static _prepareStrainData( data ) {
    return data.strain ?? null;
  }

  /**
   * Used when initializing this data model. Calculates the target difficulty for a roll based on the input data.
   * @param {EdRollOptionsInitializationData} data - The data object with which this model is initialized.
   * @returns {RollTargetData|null} The target difficulty containing base and modifiers or null if not applicable (e.g. for effect tests).
   */
  static _prepareTargetDifficulty( data ) {
    return data.target ?? null;
  }

  /**
   * Applies global step modifiers to the step data of the roll.
   * @param {object} data - The data object with which this model is initialized.
   * @returns {RollStepData|undefined} The modified step data with global bonuses applied, or undefined if no step data is present.
   */
  _applyGlobalStepModifiers( data ) {
    const stepData = data.step;
    if ( !stepData ) return;
    const actor = fromUuidSync( data.rollingActorUuid );

    if ( !actor ) return stepData;

    stepData.modifiers ??= {};

    const wounds = actor.system.characteristics.health.wounds;
    if ( this.constructor.ROLL_TYPE !== "recovery" && wounds > 0 ) {
      stepData.modifiers[game.i18n.localize( "ED.Data.Actor.Sentient.FIELDS.characteristics.health.wounds.label" )] = -wounds;
    }

    this.constructor.GLOBAL_MODIFIERS.forEach( bonus => {
      const modifierValue = actor.system.globalBonuses[bonus].value;
      if ( Number.isNumeric( modifierValue ) && modifierValue !== 0 ) stepData.modifiers[ EFFECTS.globalBonuses[bonus].label ] = modifierValue;
    } );

    return stepData;
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
      config:       ED4E,
      isGM:         game.user.isGM,
      customFlavor: context.customFlavor || this._getChatFlavor(),
    };
  }

  // endregion

}