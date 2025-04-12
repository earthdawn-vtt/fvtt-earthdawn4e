import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ED4E from "../../config/_module.mjs";
import ActionTemplate from "./templates/action.mjs";
import TargetTemplate from "./templates/targeting.mjs";
import RollPrompt from "../../applications/global/roll-prompt.mjs";
import AbilityRollOptions from "../roll/ability.mjs";
import AttackRollOptions from "../roll/attack.mjs";

/**
 * Data model template with information on Power items.
 * @property {number} powerStep    attack step
 * @property {number} damageStep    damage step
 */
export default class PowerData extends ActionTemplate.mixin(
  ItemDescriptionTemplate,
  TargetTemplate,
)  {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Power",
  ];

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
        label:    this.labelKey( "Powers.powerStep" ),
        hint:     this.hintKey( "Powers.powerStep" )
      } ),
      damageStep: new fields.NumberField( {
        required: false,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "Powers.damageStep" ),
        hint:     this.hintKey( "Powers.damageStep" )
      } ),
      armorType: new fields.StringField( {
        required: true,
        nullable: true,
        blank:    true,
        initial:  "",
        choices:  ED4E.armor,
        label:    this.labelKey( "Power.armorType" ),
        hint:     this.hintKey( "Power.armorType" )
      } ),
      damage:        new fields.SchemaField( {
        type: new fields.StringField( {
          initial:  "standard",
          choices:  ED4E.damageType,
          label:    this.labelKey( "Power.damageType" ),
          hint:     this.hintKey( "Power.damageType" )
        } ),
      } ),
      element: new fields.SchemaField( {
        type: new fields.StringField( {
          required: true,
          nullable: true,
          blank:    true,
          trim:     true,
          choices:  ED4E.elements,
          label:    this.labelKey( "Power.elementType" ),
          hint:     this.hintKey( "Power.elementType" ),
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
          label:    this.labelKey( "Power.elementSubtype" ),
          hint:     this.hintKey( "Power.elementSubtype" ),
        } )
      },
      {
        required: true,
        nullable: true,
        label:    this.labelKey( "Power.element" ),
        hint:     this.hintKey( "Power.element" ),
      } ),
    } );
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    super.migrateData( source );
    // specific migration functions
  }

  /* -------------------------------------------- */
  /*  Getter                                      */
  /* -------------------------------------------- */
  /**
   *@type {boolean}
   */
  get isCreatureAttack() {
    return this.edid === game.settings.get( "ed4e", "edidCreatureAttack" );
  }

  get baseRollOptions() {
    const rollOptions = super.baseRollOptions;
    const abilityRollOptions = {
      rollingActorUuid: this.parentActor.uuid,
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

  /* -------------------------------------------- */
  /*                    Rolling                   */
  /* -------------------------------------------- */

  async rollAbility() {
    if ( !this.isActorEmbedded ) return;
  
    const rollOptions = this.baseRollOptions;
    const rollOptionsUpdate = {
      ...rollOptions.toObject(),
      rollingActorUuid: this.parentActor.uuid,
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
        rollData: this.parentActor,
      }
    );
    return this.parentActor.processRoll( roll );
  }

  async rollAttack() {
    if ( !this.isActorEmbedded ) return;
  
    const rollOptions = this.baseRollOptions;
    const rollOptionsUpdate = {
      ...rollOptions.toObject(),
      rollingActorUuid: this.parentActor.uuid,
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
        rollData: this.parentActor,
      }
    );
    return this.parentActor.processRoll( roll );
  }

  async rollDamage() {
    ui.notifications.info( "Damage not done yet" );
  }

  async rollEffect() {
    ui.notifications.info( "Effect not done yet" );
  }

}