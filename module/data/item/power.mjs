import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ED4E, { ACTORS } from "../../config/_module.mjs";
import ActionTemplate from "./templates/action.mjs";
import TargetTemplate from "./templates/targeting.mjs";
import RollPrompt from "../../applications/global/roll-prompt.mjs";
import AbilityRollOptions from "../roll/ability.mjs";
import AttackRollOptions from "../roll/attack.mjs";
import RollProcessor from "../../services/roll-processor.mjs";

/**
 * Data model template with information on Power items.
 * @property {number} powerStep    attack step
 * @property {number} damageStep    damage step
 */
export default class PowerData extends ActionTemplate.mixin(
  ItemDescriptionTemplate,
  TargetTemplate,
)  {

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Power",
  ];

  // endregion

  // region Static Methods

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
        choices:  ED4E.armor,
      } ),
      damage:        new fields.SchemaField( {
        type: new fields.StringField( {
          initial:  "standard",
          choices:  ED4E.damageType,
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
          choices:  ED4E.elements,
        } ),
        subtype: new fields.StringField( {
          required: true,
          nullable: true,
          blank:    true,
          trim:     true,
          choices:  Object.values(
            ED4E.elementSubtypes
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

  // region Properties

  /**
   *@type {boolean}
   */
  get isCreatureAttack() {
    return this.rollType === "attack";
  }

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
    if ( systemChanges.hasOwnProperty( "rollType" ) &&
      !isAttackOrDamage( newRollType ) &&
      Number.isNumeric( currentDamageStep ) ) {
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
        game.i18n.localize( "ED.Notifications.Info.damageStepRequiresAttackOrDamage" )
      );
      changes.system.rollType = "attack";
      return;
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

  async rollAbility() {
    if ( !this.isActorEmbedded ) return;

    const rollOptions = this.baseRollOptions;
    const rollOptionsUpdate = {
      ...rollOptions.toObject(),
      rollingActorUuid: this.containingActor.uuid,
      target:           {
        tokens: game.user.targets.map( token => token.document.uuid ),
        base:   this.getDifficulty(),
      },
      chatFlavor:       "AbilityTemplate: Ability ROLL",
      rollType:         "ability",
    };

    const roll = await RollPrompt.waitPrompt(
      new AbilityRollOptions( rollOptionsUpdate ),
      {
        rollData: this.containingActor,
      }
    );
    return RollProcessor.process( roll, this.containingActor, { rollToMessage: true } );
  }

  async rollAttack() {
    if ( !this.isActorEmbedded ) return;

    const rollOptions = this.baseRollOptions;
    const rollOptionsUpdate = {
      ...rollOptions.toObject(),
      rollingActorUuid: this.containingActor.uuid,
      target:           {
        tokens: game.user.targets.map( token => token.document.uuid ),
        base:   this.getDifficulty(),
      },
      chatFlavor:       "AbilityTemplate: ATTACK ROLL",
      rollType:         "attack", // for now just basic attack, later maybe `attack${ this.rollTypeDetails.attack.weaponType }`,
    };

    const roll = await RollPrompt.waitPrompt(
      new AttackRollOptions( rollOptionsUpdate ),
      {
        rollData: this.containingActor,
      }
    );
    return RollProcessor.process( roll, this.containingActor, { rollToMessage: true } );
  }

  async rollDamage() {
    ui.notifications.info( "Damage not done yet" );
  }

  async rollEffect() {
    ui.notifications.info( "Effect not done yet" );
  }

  // endregion

}