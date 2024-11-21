import CommonTemplate from "./common.mjs";
import MovementFields from "./movement.mjs";
import ED4E from "../../../config.mjs";
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
        baseStep: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      1,
          step:     1,
          initial:  1,
          integer:  true,
          positive: true
        } ),
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
        label:           "ED.Attributes.attributes"
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
          } ),
        } ), {
          initialKeys:     [ "physical", "mystical", "social" ],
          initialKeysOnly: true,
          label:           "ED.Actor.Characteristics.defenses"
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
          } ) ,
        } ), {
          initialKeys:     [ "physical", "mystical" ],
          initialKeysOnly: true,
          label:           "ED.Actor.Characteristics.armor"
        } ),
        health: new fields.SchemaField( {
          death: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            step:     1,
            initial:  0,
            integer:  true,
            label:    "ED.Actor.Characteristics.deathRate"
          } ),
          unconscious: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            step:     1,
            initial:  0,
            integer:  true,
            label:    "ED.Actor.Characteristics.unconsciousRate"
          } ),
          woundThreshold: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            step:     1,
            initial:  0,
            integer:  true,
            label:    "ED.Actor.Characteristics.woundThreshold"
          } ),
          bloodMagic: new fields.SchemaField( {
            damage: new fields.NumberField( {
              required: true,
              nullable: false,
              min:      0,
              step:     1,
              initial:  0,
              integer:  true,
              label:    "ED.Actor.Characteristics.unconsciousRate"
            } ),
            wounds: new fields.NumberField( {
              required: true,
              nullable: false,
              min:      0,
              step:     1,
              initial:  0,
              integer:  true,
              label:    "ED.Actor.Characteristics.unconsciousRate"
            } ),
          } ),
          damage: new fields.SchemaField( {
            standard: new fields.NumberField( {
              required: true,
              nullable: false,
              min:      0,
              step:     1,
              initial:  0,
              integer:  true,
              label:    "ED.Actor.Characteristics.damageLethal"
            } ),
            stun: new fields.NumberField( {
              required: true,
              nullable: false,
              min:      0,
              step:     1,
              initial:  0,
              integer:  true,
              label:    "ED.Actor.Characteristics.damageStun"
            } ),
            total: new fields.NumberField( {
              required: true,
              nullable: false,
              min:      0,
              step:     1,
              initial:  0,
              integer:  true,
              label:    "ED.Actor.Characteristics.damage"
            } )
          }, {
            required: true,
            nullable: false,
            label:    "ED.Actor.Characteristics.damage"
          } ),
          wounds: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            step:     1,
            initial:  0,
            integer:  true,
            label:    "ED.Actor.Characteristics.wounds"
          } ),
          maxWounds: new fields.NumberField( {
            required: true,
            nullable: true,
            min:      0,
            integer:  true,
            label:    "ED.Actor.Data.Label.maxWounds",
            hint:     "ED.Actor.Data.Hint.maxWounds"
          } ),
        } ),
        recoveryTestsResource: new fields.SchemaField( {
          max: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            step:     1,
            initial:  0,
            integer:  true,
            label:    "ED.Actor.Characteristics.recoveryTestsDaily"
          } ),
          value: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            step:     1,
            initial:  0,
            integer:  true,
            label:    "ED.Data.Actor.Labels.Characteristics.recoveryTestsCurrent"

          } ),
          stunRecoveryAvailable: new fields.BooleanField( {
            required: true,
            initial:  true,
            label:    "ED.Actor.Characteristics.recoveryTestsStun"
          } ),
        } ),
        ...MovementFields.movement
      } ),
      mobRules: new fields.BooleanField( {
        required: true,
        initial:  false,
        label:    "ED.Data.Actor.Labels.mobRules",
        hint:     "ED.Data.Actor.Hints.mobRules"
      } ),
      challenge: new fields.SchemaField( {
        rate: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
          label:    "ED.Data.Actor.Labels.challengeRate"
        } ),
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
          label:    "ED.General.devotion.maximum"
        } ),
        step: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  3,
          integer:  true,
          label:    "ED.General.devotion.step"
        } ),
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
          label:    "ED.General.carryingCapacity"
        } ),
        // bonus value to strength value for determining max capacity
        bonus: new fields.NumberField( {
          required: true,
          nullable: false,
          step:     1,
          initial:  0,
          integer:  true,
          label:    "ED.General.carryingCapacityBonus"
        } ),
        // encumbrance / overload status
        status: new fields.StringField( {
          required: true,
          blank:    false,
          nullable: false,
          initial:  "notEncumbered"
        } )
      } ),
      initiative: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        step:     1,
        initial:  0,
        integer:  true,
        label:    "ED.General.Initiative"
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
          label:    "ED.General.karma.maximum"
        } ),
        step: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  4,
          integer:  true,
          label:    "ED.General.karma.step"
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

  /* -------------------------------------------- */
  /*  Data Preparation              */
  /* -------------------------------------------- */

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    this._prepareDamage();
    this._healthRating (); 
  }

  /** @inheritDoc */
  prepareDerivedData() {
  }

  /**
   * Prepare the current total damage.
   * @protected
   */
  _prepareDamage() {
    this.characteristics.health.damage.total =
      this.characteristics.health.damage.stun + this.characteristics.health.damage.standard;
  }

  _healthRating () {
    this.healthRate.max = this.characteristics.health.death;
    this.healthRate.value = this.characteristics.health.damage.stun + this.characteristics.health.damage.standard;
  }
  /* -------------------------------------------- */
  /*  Migrations                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    super.migrateData( source );
    // specific migration functions
  }
}

