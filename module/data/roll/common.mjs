import { sum } from "../../utils.mjs";
import getDice from "../../dice/step-tables.mjs";
import ED4E from "../../config/_module.mjs";
import MappingField from "../fields/mapping-field.mjs";
import FormulaField from "../fields/formula-field.mjs";
import { SparseDataModel } from "../abstract.mjs";

/**
 * @typedef {import('../../dice/ed-roll.mjs').FlavorTemplateData} FlavorTemplateData
 */

/**
 * @typedef { object} RollStepData Data for a roll step.
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
 * @property { RollStepData } step Ever information related to the step of the action, Mods, Boni, Mali etc.
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

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.RollOptions",
  ];

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
            label:    "earthdawn.baseStep",
            hint:     "earthdawn.baseStepForTheRoll",
            min:      1,
            step:     1,
            integer:  true,
          } ),
          modifiers: new MappingField(
            new fields.NumberField( {
              required: true,
              nullable: false,
              initial:  1,
              label:    "earthdawn.modifierStep",
              hint:     "earthdawn.modifierStepForTheRoll",
              step:     1,
              integer:  true,
            } ),
            {
              required:        true,
              initialKeysOnly: false,
              label:           "allModifiers",
              hint:            "keys are localizable labels of the given step modifying value",
            },
          ),
          total: new fields.NumberField( {
            required: true,
            nullable: false,
            initial:  this.initTotalStep,
            label:    "earthdawn.totalStep",
            hint:     "earthdawn.totalStepForTheRoll",
            min:      1,
            step:     1,
            integer:  true,
          } ),
        },
        {
          required: true,
          nullable: false,
          label:    "localize: step info",
          hint:     "localize: all data about how the step is composed",
        },
      ),
      karma:     this._bonusResource,
      devotion:  this._bonusResource,
      extraDice: new MappingField( new fields.NumberField( {
        required: true,
        nullable: false,
        initial:  1,
        label:    "earthdawn.baseStep",
        hint:     "earthdawn.baseStepForTheRoll",
        min:      1,
        step:     1,
        integer:  true,
      } ), {
        required:        true,
        initialKeysOnly: false,
        label:           "extra Steps apart from step, karma and devotion",
        hint:            "keys are localized labels of the given extra step",
      } ),
      target: new fields.SchemaField(
        {
          base: new fields.NumberField( {
            required: true,
            nullable: false,
            initial:  () => game.settings.get( "ed4e", "minimumDifficulty" ),
            label:    "earthdawn.baseDifficulty",
            hint:     "earthdawn.baseDifficultyForTheRoll",
            min:      0,
            step:     1,
          } ),
          modifiers: new MappingField(
            new fields.NumberField( {
              required: true,
              nullable: true,
              initial:  0,
              label:    "earthdawn.modifierDifficulty",
              hint:     "earthdawn.modifierDifficultyForTheRoll",
              min:      0,
              step:     1,
            } ),
            {
              required:        true,
              initialKeysOnly: false,
              label:           "allModifiers",
              hint:            "keys are localizable labels of the given difficulty modifying value",
            },
          ),
          total: new fields.NumberField( {
            required: true,
            nullable: false,
            initial:  this.initTotalTarget,
            label:    "earthdawn.totalDifficulty",
            hint:     "earthdawn.totalDifficultyForTheRoll",
            min:      0,
            step:     1,
            integer:  true,
          } ),
          public: new fields.BooleanField( {
            required: true,
            nullable: false,
            initial:  true,
            label:    "X.targetPublic",
            hint:     "X.whetherTheDifficultyIsKnownPublicly"
          } ),
          tokens: new fields.SetField( new fields.DocumentUUIDField(
            {
              // type:  "Token",
              label: "TODO.Target.tokenUuid",
              hint:  "TODO.Target.tokenUuidHint",
            }
          ), {
            required: false,
            label:    "TODO.Target.tokens",
            hint:     "TODO.Target.tokensHint",
          } ),
        },
        {
          required: true,
          nullable: false,
          label:    "localize: difficulty info",
          hint:     "localize: all data about how the difficulty is composed",
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
            label:    "earthdawn.strain",
          } ),
          modifiers: new MappingField(
            new fields.NumberField( {
              required: true,
              nullable: false,
              initial:  1,
              label:    "earthdawn.modifierStep",
              hint:     "earthdawn.modifierStepForTheRoll",
              min:      0,
              step:     1,
              integer:  true,
            } ),
            {
              required:        true,
              initialKeysOnly: false,
              label:           "allModifiers",
              hint:            "keys are localizable labels of the given step modifying value",
            },
          ),
          total: new fields.NumberField( {
            required: true,
            nullable: false,
            initial:  this.initTotalStrain,
            label:    "earthdawn.totalStep",
            hint:     "earthdawn.totalStepForTheRoll",
            min:      0,
            step:     1,
            integer:  true,
          } ),
        },
        {
          required: true,
          nullable: false,
          label:    "localize: step info",
          hint:     "localize: all data about how the step is composed",
        },
      ),
      chatFlavor: new fields.StringField( {
        required: true,
        nullable: false,
        blank:    true,
        initial:  "",
        label:    "localize: roll chat flavour",
        hint:     "localize: text that is added to the chat message when this call is put to chat",
      } ),
      rollingActorUuid: new fields.DocumentUUIDField( {
        required: false,
        label:    "TODO.RollingActor",
        hint:     "TODO.RollingActorHint",
      } ),
      testType: new fields.StringField( {
        required: true,
        nullable: false,
        blank:    true,
        initial:  "arbitrary",
        label:    "localize: test type",
        hint:     "localize: type of this roll test, like action or effect test, or arbitrary step roll",
      } ),
      rollType: new fields.StringField( {
        required: false,
        nullable: true,
        blank:    true,
        initial:  "",
        label:    "localize: roll type",
        hint:     "localize: type of this roll, like attackMelee, or threadWeaving",
      } ),
      rollSubType: new fields.StringField( {
        required: false,
        nullable: true,
        blank:    true,
        initial:  "",
        label:    "localize: roll sub type",
        hint:     "localize: subtype of this roll, like attackMelee, or threadWeaving",
      } ),

    };
  }

  get totalTarget() {
    return Math.max(
      this.target.base + sum( Object.values( this.target.modifiers ) ),
      game.settings.get( "ed4e", "minimumDifficulty" ),
    );
  }

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

  get totalStep() {
    return this.step.base + sum( Object.values( this.step.modifiers ) );
  }

  /** @inheritDoc */
  updateSource( changes = {}, options = {} ) {
    const updates = super.updateSource(
      foundry.utils.mergeObject( changes, {
        "karma.dice":    getDice( this.karma.step ),
        "devotion.dice": getDice( this.devotion.step ),
      } ),
      options
    );
    updates.step ??= {};
    updates.target ??= {};
    updates.step.total = this.step.total = this.totalStep;
    updates.target.total = this.target.total = this.totalTarget;
    return super.updateSource( updates, options );
  }

  static initDiceForStep( parent ) {
    return getDice( parent.step.total ?? parent.step );
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
          label:    "earthdawn.karmaPoints",
          hint:     "earthdawn.howManyKarmaPointsAreUsedForThisRoll",
          min:      0,
          step:     1,
          integer:  true,
        } ),
        available: new fields.NumberField( {
          required: true,
          nullable: false,
          initial:  0,
          label:    "earthdawn.availableKarmaPoints",
          hint:     "earthdawn.howManyKarmaPointsAreAvailable",
          min:      0,
          step:     1,
          integer:  true,
        } ),
        step: new fields.NumberField( {
          required: true,
          nullable: false,
          initial:  this.initResourceStep,
          label:    "earthdawn.karmaStep",
          hint:     "earthdawn.whatIsTheStepForKarmaDice",
          min:      1,
          step:     1,
          integer:  true,
        } ),
        dice: new FormulaField( {
          required: true,
          initial:  this.initDiceForStep,
          label:    "earthdawn.diceForStep",
          hint:     "earthdawn.TheDiceForGivenStep",
        } ),
      },
      {
        required: true,
        nullable: false,
      },
    );
  }

  /**
   * Prepares data for rendering flavor templates in roll chat messages.
   * Subclasses of EdRollOptions can override this method to add roll-type specific data
   * to the base FlavorTemplateData.
   * @param {object} context - Initial template data containing base roll information
   * @returns {Promise<FlavorTemplateData>} Enhanced template data for the specific roll type
   */
  async getFlavorTemplateData( context ) {
    return context;
  }

}