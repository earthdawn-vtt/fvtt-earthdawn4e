import CommonTemplate from "./common.mjs";
import MovementFields from "./movement.mjs";
import ED4E from "../../../config/_module.mjs";
import MappingField from "../../fields/mapping-field.mjs";

/**
 * A template for all actors that represent sentient beings and have such stats.
 * @mixin
 */
export default class SentientTemplate extends CommonTemplate {

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      attributes: new MappingField( new fields.SchemaField( {
        step: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      1,
          step:     1,
          initial:  1,
          integer:  true,
          positive: true
        } )
      } ), {
        initialKeys:     ED4E.attributes,
        initialKeysOnly: true,
        label:           this.labelKey( "attributes" ),
        hint:            this.hintKey( "attributes" )
      } ),
      healthRate: new fields.SchemaField( {
        value: new fields.NumberField( {
          required: true,
          nullable: false,
          step:     1,
          initial:  0,
          integer:  true,
        } ),
        max: new fields.NumberField( {
          required: true,
          nullable: false,
          step:     1,
          initial:  0,
          integer:  true,
        } )
      }, {
        label: this.labelKey( "healthRate" ),
        hint:  this.hintKey( "healthRate" ),
      } ),
      characteristics: new fields.SchemaField( {
        defenses: new MappingField( new fields.SchemaField( {
          baseValue: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            step:     1,
            initial:  0,
            integer:  true,
          } ),
          value: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            step:     1,
            initial:  0,
            integer:  true,
            label:    this.labelKey( "Characteristics.defenseValue" ),
            hint:     this.hintKey( "Characteristics.defenseValue" )
          } ),
        } ), {
          initialKeys:     [ "physical", "mystical", "social" ],
          initialKeysOnly: true,
          label:           this.labelKey( "Characteristics.defenses" )
        } ),
        armor: new MappingField( new fields.SchemaField( {
          baseValue: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            step:     1,
            initial:  0,
            integer:  true,
          } ),
          value: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            step:     1,
            initial:  0,
            integer:  true,
            label:    this.labelKey( "Characteristics.armorValue" ),
            hint:     this.hintKey( "Characteristics.armorValue" )
          } ) ,
        } ), {
          initialKeys:     [ "physical", "mystical" ],
          initialKeysOnly: true,
          label:           this.labelKey( "Characteristics.armor" ),
          hint:            this.hintKey( "Characteristics.armor" ),
        } ),
        health: new fields.SchemaField( {
          death: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            step:     1,
            initial:  0,
            integer:  true,
            label:    this.labelKey( "Characteristics.deathRating" ),
            hint:     this.hintKey( "Characteristics.deathRating" )
          } ),
          unconscious: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            step:     1,
            initial:  0,
            integer:  true,
            label:    this.labelKey( "Characteristics.unconsciousRate" ),
            hint:     this.hintKey( "Characteristics.unconsciousRate" )
          } ),
          woundThreshold: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            step:     1,
            initial:  0,
            integer:  true,
            label:    this.labelKey( "Characteristics.woundThreshold" ),
            hint:     this.hintKey( "Characteristics.woundThreshold" )
          } ),
          bloodMagic: new fields.SchemaField( {
            damage: new fields.NumberField( {
              required: true,
              nullable: false,
              min:      0,
              step:     1,
              initial:  0,
              integer:  true,
              label:    this.labelKey( "Characteristics.bloodMagicDamage" ),
              hint:     this.hintKey( "Characteristics.bloodMagicDamage" )
            } ),
            wounds: new fields.NumberField( {
              required: true,
              nullable: false,
              min:      0,
              step:     1,
              initial:  0,
              integer:  true,
              label:    this.labelKey( "Characteristics.bloodMagicWounds" ),
              hint:     this.hintKey( "Characteristics.bloodMagicWounds" )
            } ),
          }, {
            label: this.labelKey( "Characteristics.bloodMagic" ),
            hint:  this.hintKey( "Characteristics.bloodMagic" ),
          } ),
          damage: new fields.SchemaField( {
            standard: new fields.NumberField( {
              required: true,
              nullable: false,
              min:      0,
              step:     1,
              initial:  0,
              integer:  true,
              label:    this.labelKey( "Characteristics.damageStandard" ),
              hint:     this.hintKey( "Characteristics.damageStandard" ),
            } ),
            stun: new fields.NumberField( {
              required: true,
              nullable: false,
              min:      0,
              step:     1,
              initial:  0,
              integer:  true,
              label:    this.labelKey( "Characteristics.damageStun" ),
              hint:     this.hintKey( "Characteristics.damageStun" ),
            } ),
            total: new fields.NumberField( {
              required: true,
              nullable: false,
              min:      0,
              step:     1,
              initial:  0,
              integer:  true,
              label:    this.labelKey( "Characteristics.damageTotal" ),
              hint:     this.hintKey( "Characteristics.damageTotal" ),
            } )
          }, {
            required: true,
            nullable: false,
            label:    this.labelKey( "Characteristics.damage" ),
            hint:     this.hintKey( "Characteristics.damage" ),
          } ),
          wounds: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            step:     1,
            initial:  0,
            integer:  true,
            label:    this.labelKey( "Characteristics.wounds" ),
            hint:     this.hintKey( "Characteristics.wounds" )
          } ),
          maxWounds: new fields.NumberField( {
            required: true,
            nullable: true,
            min:      0,
            integer:  true,
            label:    this.labelKey( "Characteristics.maxWounds" ),
            hint:     this.hintKey( "Characteristics.maxWounds" ),
          } ),
        }, {
          label: this.labelKey( "Characteristics.health" ),
          hint:  this.hintKey( "Characteristics.health" ),
        } ),
        recoveryTestsResource: new fields.SchemaField( {
          value: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            step:     1,
            initial:  0,
            integer:  true,
            label:    this.labelKey( "Characteristics.recoveryTestsCurrent" ),
            hint:     this.hintKey( "Characteristics.recoveryTestsCurrent" )

          } ),
          max: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            step:     1,
            initial:  0,
            integer:  true,
            label:    this.labelKey( "Characteristics.recoveryTestsMax" ),
            hint:     this.hintKey( "Characteristics.recoveryTestsMax" )
          } ),
          step: new fields.NumberField( {
            nullable: false,
            min:      0,
            step:     1,
            integer:  true,
            label:    this.labelKey( "recoveryTestStep" ),
            hint:     this.hintKey( "recoveryTestStep" ),
          } ),
          stunRecoveryAvailable: new fields.BooleanField( {
            required: true,
            initial:  true,
            label:    this.labelKey( "Characteristics.stunRecoveryAvailable" ),
            hint:     this.hintKey( "Characteristics.stunRecoveryAvailable" )
          } ),
        }, {
          label: this.labelKey( "Characteristics.recoveryTestsResource" ),
          hint:  this.hintKey( "Characteristics.recoveryTestsResource" ),
        } ),
        ...MovementFields.movement
      }, {
        label: this.labelKey( "characteristics" ),
        hint:  this.hintKey( "characteristics" ),
      } ),
      isMob: new fields.BooleanField( {
        required: true,
        initial:  false,
        label:    this.labelKey( "isMob" ),
        hint:     this.hintKey( "isMob" ),
      } ),
      challenge: new fields.SchemaField( {
        rate: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
          label:    this.labelKey( "challengeRate" ),
          hint:     this.hintKey( "challengeRate" )
        } ),
      }, {
        label: this.labelKey( "challenge" ),
        hint:  this.hintKey( "challenge" ),
      } ),
      condition: new fields.SchemaField( {
        aggressiveAttack: new fields.BooleanField( {
          required: true,
          initial:  false,
          label:    "ED.Actor.Condition.aggressiveAttack"
        } ),
        blindsided: new fields.BooleanField( {
          required: true,
          initial:  false,
          label:    "ED.Actor.Condition.blindsided"
        } ),
        cover: new fields.SchemaField( {
          partial: new fields.BooleanField( {
            required: true,
            initial:  false,
            label:    "ED.Actor.Condition.coverPartial"
          } ),
          full: new fields.BooleanField( {
            required: true,
            initial:  false,
            label:    "ED.Actor.Condition.coverFull"
          } ),
        } ),
        darkness: new fields.SchemaField( {
          partial: new fields.BooleanField( {
            required: true,
            initial:  false,
            label:    "ED.Actor.Condition.darknessPartial"
          } ),
          full: new fields.BooleanField( {
            required: true,
            initial:  false,
            label:    "ED.Actor.Condition.darknessFull"
          } ),
        } ),
        defensiveStance: new fields.BooleanField( {
          required: true,
          initial:  false,
          label:    "ED.Actor.Condition.defensiveStance"
        } ),
        fury: new fields.BooleanField( {
          required: true,
          initial:  false,
          label:    "ED.Actor.Condition.fury"
        } ),
        harried: new fields.BooleanField( {
          required: true,
          initial:  false,
          label:    "ED.Actor.Condition.harried"
        } ),
        impairedMovement: new fields.SchemaField( {
          partial: new fields.BooleanField( {
            required: true,
            initial:  false,
            label:    "ED.Actor.Condition.impairedMovementPartial"
          } ),
          full: new fields.BooleanField( {
            required: true,
            initial:  false,
            label:    "ED.Actor.Condition.impairedMovementFull"
          } ),
        } ),
        knockedDown: new fields.BooleanField( {
          required: true,
          initial:  false,
          label:    "ED.Actor.Condition.knockedDown"
        } ),
        overwhelmed: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
          label:    "ED.Actor.Condition.overwhelmed"
        } ),
        surprised: new fields.BooleanField( {
          required: true,
          initial:  false,
          label:    "ED.Actor.Condition.surprised"
        } )
      } ),
      devotion: new fields.SchemaField( {
        value: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
          label:    "ED.General.devotion.current"
        } ),
        max: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
          label:    this.labelKey( "devotionMax" ),
          hint:     this.hintKey( "devotionMax" )
        } ),
        step: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  3,
          integer:  true,
          label:    this.labelKey( "devotionStep" ),
          hint:     this.hintKey( "devotionStep" )
        } ),
      }, {
        label: this.labelKey( "devotion" ),
        hint:  this.hintKey( "devotion" ),
      } ),
      encumbrance: new fields.SchemaField( {
        // current load / weight carried
        value: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          label:    "ED.General.carriedLoad"
        } ),
        // maximum carriable weight
        max: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          label:    this.labelKey( "encumbranceMax" ),
          hint:     this.hintKey( "encumbranceMax" ),
        } ),
        // bonus value to strength value for determining max capacity
        bonus: new fields.NumberField( {
          required: true,
          nullable: false,
          step:     1,
          initial:  0,
          integer:  true,
          label:    this.labelKey( "encumbranceBonus" ),
          hint:     this.hintKey( "encumbranceBonus" ),
        } ),
        // encumbrance / overload status
        status: new fields.StringField( {
          required: true,
          blank:    false,
          nullable: false,
          initial:  "notEncumbered"
        } )
      }, {
        label: this.labelKey( "encumbrance" ),
        hint:  this.hintKey( "encumbrance" ),
      } ),
      initiative: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        step:     1,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "initiative" ),
        hint:     this.hintKey( "initiative" ),
      } ),
      karma: new fields.SchemaField( {
        useAlways: new fields.BooleanField( {
          required: true,
          initial:  false,
          label:    "ED.General.Karma.karmaAlways"
        } ),
        value: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
          label:    "ED.General.karma.current"
        } ),
        max: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
          label:    this.labelKey( "karmaMax" ),
          hint:     this.hintKey( "karmaMax" ),
        } ),
        step: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  4,
          integer:  true,
          label:    this.labelKey( "karmaStep" ),
          hint:     this.hintKey( "karmaStep" ),
        } ),
        freeAttributePoints: new fields.NumberField( {
          required: false,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
          label:    "ED.General.freeAttributePoints"
        } ),
      }, {
        label: this.labelKey( "karma" ),
        hint:  this.hintKey( "karma" ),
      } ),
      relations: new MappingField( new fields.SchemaField( {
        attitude: new fields.StringField( {
          choices: [ "config stuff" ]
        } ),
        favors:
          new MappingField( new fields.SchemaField( {
            owingThem: new fields.NumberField( {
              min:     0,
              step:    1,
              integer: true,
              initial: 0
            } ),
            owingMe: new fields.NumberField( {
              min:     0,
              step:    1,
              integer: true,
              initial: 0
            } )
          } ), {
            initialKeys:     [ "small", "large" ],
            initialKeysOnly: true
          } )
      } ), {
        initialKeysOnly: false,
        label:           "ED.Relations.relations"
      } )
    } );
  }

  // region  Data Preparation

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    this._prepareDamage();
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    this._prepareHealthRating ();
  }

  /**
   * Prepare the current total damage.
   * @protected
   */
  _prepareDamage() {
    this.characteristics.health.damage.total =
      this.characteristics.health.damage.stun + this.characteristics.health.damage.standard;
  }

  /**
   * Prepare the current health rating that can be used by external modules.
   * @private
   */
  _prepareHealthRating () {
    this.healthRate.max = this.characteristics.health.death;
    this.healthRate.value = this.characteristics.health.damage.total;
  }

  // endregion


  // region Migrations

  /** @inheritDoc */
  static migrateData( source ) {
    super.migrateData( source );
    // specific migration functions
  }

  // endregion

}

