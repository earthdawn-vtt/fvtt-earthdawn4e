import { sum } from "../../utils.mjs";
import getDice from "../../dice/step-tables.mjs";
import ED4E from "../../config.mjs";
import FormulaField from "../fields/formula-field.mjs";
import MappingField from "../fields/mapping-field.mjs";

export default class EdRollOptions extends foundry.abstract.DataModel {
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
      karma:     this.#bonusResource,
      devotion:  this.#bonusResource,
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
        hint:     "localize: text that is added to the chatmessage when this call is put to chat",
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

    return new EdRollOptions( data, options );
  }

  static initResourceStep( source ) {
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
    return super.updateSource(
      foundry.utils.mergeObject( changes, {
        "step.total":    this.totalStep,
        "target.total":  this.totalTarget,
        "karma.dice":    getDice( this.karma.step ),
        "devotion.dice": getDice( this.devotion.step ),
      } ),
      options
    );
  }

  static initDiceForStep( parent ) {
    return getDice( parent.step.total ?? parent.step );
  }

  /**
   * @description Bonus resources to be added globally
   * @type {object}
   * @property {number} something Value of the global bonus
   */
  static get #bonusResource() {
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


}