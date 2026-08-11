import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ActionTemplate from "./templates/action.mjs";
import TargetTemplate from "./templates/targeting.mjs";
import RollPrompt from "../../applications/global/roll-prompt.mjs";
import AbilityRollOptions from "../roll/ability.mjs";
import RollProcessor from "../../services/roll-processor.mjs";
import DamageRollOptions from "../roll/damage.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";
import * as ACTORS from "../../config/actors.mjs";
import * as COMBAT from "../../config/combat.mjs";
import * as MAGIC from "../../config/magic.mjs";
import AttackWorkflow from "../../workflows/workflow/attack-workflow.mjs";


/**
 * @import { PowerSystemData } from "./_types.mjs";
 */

/**
 * Data model for power items.
 * @augments {ActionTemplate<PowerSystemData>}
 * @mixes ItemDescriptionTemplate
 * @mixes TargetTemplate
 * @see {@link PowerSystemData} The system data model for power items.
 */
export default class PowerData extends ActionTemplate.mixin(
  ItemDescriptionTemplate,
  TargetTemplate,
)  {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      powerStep: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      damageStep: new fields.NumberField( {
        required: false,
        nullable: true,
        min:      0,
        integer:  true,
      } ),
      armorType: new fields.StringField( {
        required: true,
        nullable: true,
        blank:    true,
        initial:  "",
        choices:  ACTORS.armor,
      } ),
      damage:        new fields.SchemaField( {
        type: new fields.StringField( {
          initial:  "standard",
          choices:  COMBAT.damageType,
        } ),
        armorType: new fields.StringField( {
          required: true,
          nullable: true,
          blank:    true,
          initial:  "",
          choices:  ACTORS.armor,
        } ),
        ignoreArmor: new fields.BooleanField( {
          required: true,
          nullable: false,
          initial:  false,
        } ),
      } ),
      element: new fields.SchemaField( {
        type: new fields.StringField( {
          required: true,
          nullable: true,
          blank:    true,
          trim:     true,
          choices:  MAGIC.elements,
        } ),
        subtype: new fields.StringField( {
          required: true,
          nullable: true,
          blank:    true,
          trim:     true,
          choices:  Object.values(
            MAGIC.elementSubtypes
          ).map(
            subtypes => Object.keys( subtypes )
          ).flat(),
        } )
      },
      {
        required: true,
        nullable: true,
      } ),
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Power",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: SYSTEM_TYPES.Item.power,
    }, {
      inplace: false
    },
  ) );

  // endregion

  // region Getters

  /** @inheritDoc */
  get baseRollOptions() {
    const rollOptions = super.baseRollOptions;
    const abilityRollOptions = {
      rollingActorUuid: this.containingActor.uuid,
      abilityUuid:      this.parent.uuid,
      step:             {
        base:      this.powerStep,
        modifiers: {},
      },
      karma:           rollOptions.karma,
      devotion:        rollOptions.devotion,
      extraDice:       {
        // this should be the place for things like flame weapon, etc. but still needs to be implemented
      },
      target:          {
        base:      this.getDifficulty(),
        modifiers: {},
        public:    false,
      },
      strain:          {
        base:      this.strain,
        modifiers: {},
      },
      chatFlavor:      "AbilityTemplate: ABILITY ROLL",
      testType:        "action",
      rollType:        "",
    };

    return new AbilityRollOptions( abilityRollOptions );
  }

  /**
   *@type {boolean}
   */
  get isCreatureAttack() {
    return this.rollType === "attack";
  }

  /**
   * The final rank for this power, that is, its power step.
   * @type {number}
   */
  get rankFinal() {
    return this.powerStep;
  }

  // endregion

  // region Life Cycle Events

  /** @inheritDoc */
  async _preUpdate( changes, options, user ) {
    if ( await super._preUpdate( changes, options, user ) === false ) return false;

    const systemChanges = changes.system;
    if ( !systemChanges ) return;

    // Extract validation logic to reduce complexity
    this._validateDamageStepRules( changes );
  }

  /**
   * Validates and enforces damage step business rules
   * @param {object} changes - The changes object being applied
   * @private
   */
  _validateDamageStepRules( changes ) {
    const systemChanges = changes.system;
    const isAttackOrDamage = rollType => [ "attack", "damage" ].includes( rollType );

    // Get current and new values
    const currentRollType = this.rollType;
    const newRollType = systemChanges.rollType ?? currentRollType;
    const currentDamageStep = this.damageStep;
    const newDamageStep = systemChanges.hasOwnProperty( "damageStep" ) ? systemChanges.damageStep : currentDamageStep;
    const currentPowerStep = this.powerStep;
    const newPowerStep = systemChanges.hasOwnProperty( "powerStep" ) ? systemChanges.powerStep : currentPowerStep;

    // if rollType is being changed away from attack/damage, clear damage step
    if ( systemChanges.hasOwnProperty( "rollType" )
      && !isAttackOrDamage( newRollType )
      && Number.isNumeric( currentDamageStep ) ) {
      changes.system.damageStep = null;
      return;
    }

    // if damageStep is being cleared and rollType is attack, set damageStep to powerStep
    if ( systemChanges.damageStep === null && newRollType === "attack" ) {
      changes.system.damageStep = newPowerStep;
      return;
    }

    // handle damage roll type validation and synchronization
    if ( newRollType === "damage" ) {
      this._synchronizeDamageSteps( changes, systemChanges, newDamageStep, newPowerStep );
      return;
    }

    // if power has a damage step, rollType must be "attack" or "damage"
    if ( Number.isNumeric( newDamageStep ) && !isAttackOrDamage( newRollType ) ) {
      ui.notifications.info(
        _loc( "ED.Notifications.Info.damageStepRequiresAttackOrDamage" )
      );
      changes.system.rollType = "attack";
    }

  }


  /**
   * Synchronizes power step and damage step for damage roll types
   * @param {object} changes - The changes object
   * @param {object} systemChanges - System changes
   * @param {number} newDamageStep - New damage step value
   * @param {number} newPowerStep - New power step value
   * @private
   */
  _synchronizeDamageSteps( changes, systemChanges, newDamageStep, newPowerStep ) {
    if ( systemChanges.hasOwnProperty( "damageStep" ) && !systemChanges.hasOwnProperty( "powerStep" ) ) {
      changes.system.powerStep = newDamageStep;
    } else if ( systemChanges.hasOwnProperty( "powerStep" ) && !systemChanges.hasOwnProperty( "damageStep" ) ) {
      changes.system.damageStep = newPowerStep;
    } else if ( newDamageStep !== newPowerStep ) {
      // If both are being changed but to different values, sync them to damageStep
      changes.system.powerStep = newDamageStep;
    }
  }

  // endregion

  // region Rolling

  /** @inheritDoc */
  getRollData() {
    const rollData = super.getRollData();
    Object.assign( rollData, super.getTemplatesRollData() );
    return Object.assign( rollData, {} );
  }

  /**
   * Roll an ability test with this power.
   * @returns {Promise<EdRoll|void>} The processed roll.
   */
  async rollAbility() {
    if ( !this.isActorEmbedded ) return;

    const rollOptions = AbilityRollOptions.fromActor(
      {
        ability: this.parentDocument,
      },
      this.containingActor,
    );

    const roll = await RollPrompt.waitPrompt(
      rollOptions,
      {
        rollData: this.containingActor,
      }
    );
    return RollProcessor.process(
      roll,
      this.containingActor,
      { rollToMessage: true }
    );
  }

  /**
   * Roll an attack test with this power.
   * @returns {Promise<EdRoll|void>} The processed roll.
   */
  async rollAttack() {
    if ( !this.isActorEmbedded ) return;

    const attackWorkflow = new AttackWorkflow(
      this.containingActor,
      {
        attackAbility: this.parentDocument,
        attackType:    this.rollTypeDetails.attack?.weaponTypes,
      },
    );

    return /** @type {Promise<Roll>} */ attackWorkflow.execute();
  }

  /**
   * Roll damage with this power.
   * @returns {Promise<EdRoll|void>} The processed roll.
   */
  async rollDamage() {
    const rollOptions = DamageRollOptions.fromActor(
      {
        "damageSourceType": "power",
        "sourceDocument":   this.parent,
      },
      this.containingActor,
      {
        rollData: this.containingActor,
      }
    );

    const roll = await RollPrompt.waitPrompt(
      rollOptions,
      {
        rollData: this.containingActor,
      }
    );
    return RollProcessor.process( roll, this.containingActor, { rollToMessage: true } );
  }

  /**
   * Roll the effect of this power.
   * @hidden
   */
  async rollEffect() {
    ui.notifications.info( "Effect not done yet" );
  }

  // endregion

}