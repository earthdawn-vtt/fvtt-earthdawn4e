import CommonTemplate from "./common.mjs";
import MovementFields from "./movement.mjs";
import ED4E from "../../../config/_module.mjs";
import MappingField from "../../fields/mapping-field.mjs";

/**
 * A template for all actors that represent sentient beings and have such stats.
 * @mixin
 */
export default class SentientTemplate extends CommonTemplate {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Actor.Sentient",
  ];

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
        } ),
        health: new fields.SchemaField( {
          death: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            step:     1,
            initial:  0,
            integer:  true,
          } ),
          unconscious: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            step:     1,
            initial:  0,
            integer:  true,
          } ),
          woundThreshold: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            step:     1,
            initial:  0,
            integer:  true,
          } ),
          bloodMagic: new fields.SchemaField( {
            damage: new fields.NumberField( {
              required: true,
              nullable: false,
              min:      0,
              step:     1,
              initial:  0,
              integer:  true,
            } ),
            wounds: new fields.NumberField( {
              required: true,
              nullable: false,
              min:      0,
              step:     1,
              initial:  0,
              integer:  true,
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
            } ),
            stun: new fields.NumberField( {
              required: true,
              nullable: false,
              min:      0,
              step:     1,
              initial:  0,
              integer:  true,
            } ),
            total: new fields.NumberField( {
              required: true,
              nullable: false,
              min:      0,
              step:     1,
              initial:  0,
              integer:  true,
            } )
          }, {
            required: true,
            nullable: false,
          } ),
          wounds: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            step:     1,
            initial:  0,
            integer:  true,
          } ),
          maxWounds: new fields.NumberField( {
            required: true,
            nullable: true,
            min:      0,
            integer:  true,
          } ),
        } ),
        recoveryTestsResource: new fields.SchemaField( {
          value: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            step:     1,
            initial:  0,
            integer:  true,

          } ),
          max: new fields.NumberField( {
            required: true,
            nullable: false,
            min:      0,
            step:     1,
            initial:  0,
            integer:  true,
          } ),
          step: new fields.NumberField( {
            nullable: false,
            min:      0,
            step:     1,
            integer:  true,
          } ),
          stunRecoveryAvailable: new fields.BooleanField( {
            required: true,
            initial:  true,
          } ),
        } ),
        ...MovementFields.movement
      } ),
      concentrationSource: new fields.DocumentUUIDField( {
        required: false,
        empty:    false,
      } ),
      condition: new fields.SchemaField( {
        aggressiveAttack: new fields.BooleanField( {
          required: true,
          initial:  false,
        } ),
        blindsided: new fields.BooleanField( {
          required: true,
          initial:  false,
        } ),
        cover: new fields.SchemaField( {
          partial: new fields.BooleanField( {
            required: true,
            initial:  false,
          } ),
          full: new fields.BooleanField( {
            required: true,
            initial:  false,
          } ),
        } ),
        darkness: new fields.SchemaField( {
          partial: new fields.BooleanField( {
            required: true,
            initial:  false,
          } ),
          full: new fields.BooleanField( {
            required: true,
            initial:  false,
          } ),
        } ),
        defensiveStance: new fields.BooleanField( {
          required: true,
          initial:  false,
        } ),
        fury: new fields.BooleanField( {
          required: true,
          initial:  false,
        } ),
        harried: new fields.BooleanField( {
          required: true,
          initial:  false,
        } ),
        impairedMovement: new fields.SchemaField( {
          partial: new fields.BooleanField( {
            required: true,
            initial:  false,
          } ),
          full: new fields.BooleanField( {
            required: true,
            initial:  false,
          } ),
        } ),
        knockedDown: new fields.BooleanField( {
          required: true,
          initial:  false,
        } ),
        overwhelmed: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
        } ),
        surprised: new fields.BooleanField( {
          required: true,
          initial:  false,
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
        } ),
        max: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
        } ),
        step: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  3,
          integer:  true,
        } ),
      } ),
      encumbrance: new fields.SchemaField( {
        // current load / weight carried
        value: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
        } ),
        // maximum carriable weight
        max: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
        } ),
        // bonus value to strength value for determining max capacity
        bonus: new fields.NumberField( {
          required: true,
          nullable: false,
          step:     1,
          initial:  0,
          integer:  true,
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
      } ),
      karma: new fields.SchemaField( {
        useAlways: new fields.BooleanField( {
          required: true,
          initial:  false,
        } ),
        value: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
        } ),
        max: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
        } ),
        step: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  4,
          integer:  true,
        } ),
        freeAttributePoints: new fields.NumberField( {
          required: false,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
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
      } )
    } );
  }

  // region Properties

  static SENTIENT_ACTOR_TYPES = [ "character", "npc", "creature", "spirit", "horror", "dragon" ];

  get hasSpellsAttuned() {
    return this.parent.getMatrices().some(
      matrix => {
        return foundry.utils.isEmpty( matrix.system?.matrix.spells ) === false;
      }
    );
  }

  get isDead() {
    return this.characteristics.health.death > 0
      && this.characteristics.health.damage.standard >= this.characteristics.health.death;
  }

  get isUnconscious() {
    return !this.isDead
      && this.characteristics.health.unconscious > 0
      && this.characteristics.health.damage.total >= this.characteristics.health.unconscious;
  }

  // endregion

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

  // region Life Cycle Events

  async _preUpdate( changes, options, user ) {
    if ( await super._preUpdate( changes, options, user ) === false ) return false;

    if ( this.isAboutToDie( changes.system?.characteristics?.health?.damage?.standard ) ) {
      if ( this.hasSpellsAttuned ) {
        ui.notifications.info(
          "ED.X.TODO.{actorName} dies. All spells are dislodged from their matrices.",
          {
            localize: true,
            format:   {
              actorName: this.parent.name
            }
          }
        );
        this.parent.emptyAllMatrices();
      }
    }
  }

  /** @inheritDoc */
  _onUpdate( changed, options, userId ) {
    super._onUpdate( changed, options, userId );

    if ( game.user.id === userId ) {
      this.parent?.toggleStatusEffect( CONFIG.specialStatusEffects.DEFEATED, { active: this.isDead, overlay: true } );
      this.parent?.toggleStatusEffect( "unconscious", { active: this.isUnconscious && !this.isDead, overlay: true } );
    }
  }

  // endregion

  // region Rolling

  /** @inheritDoc */
  getRollData() {
    const rollData = super.getRollData() ?? {};

    return Object.assign( rollData,
      // attribute steps
      // dex, str, tou, per, wil, cha
      Object.fromEntries(
        Object.entries( this.attributes ).map( ( [ key, value ] ) => [ key, value.step ] )
      ),
      // dexterity, strength, toughness, perception, willpower, charisma
      Object.fromEntries(
        Object.entries( this.attributes ).map( ( [ key, value ] ) => [ ED4E.attributes[ key ].fullKey, value.step ] )
      ),
      // armor values
      // pa, ma
      // physicalArmor, mysticArmor
      {
        pa:                                 this.characteristics.armor.physical.value,
        physicalArmor:                      this.characteristics.armor.physical.value,
        ["physicalArmor".toLowerCase()]:    this.characteristics.armor.physical.value,
        ma:                                 this.characteristics.armor.mystical.value,
        mysticArmor:                        this.characteristics.armor.mystical.value,
        ["mysticArmor".toLowerCase()]:      this.characteristics.armor.mystical.value,
      },
      // defense values
      // pd, md, sd
      // physicalDefense, mysticalDefense, socialDefense
      {
        pd:                                   this.characteristics.defenses.physical.value,
        physicalDefense:                      this.characteristics.defenses.physical.value,
        ["physicalDefense".toLowerCase()]:    this.characteristics.defenses.physical.value,
        md:                                   this.characteristics.defenses.mystical.value,
        mysticalDefense:                      this.characteristics.defenses.mystical.value,
        ["mysticalDefense".toLowerCase()]:    this.characteristics.defenses.mystical.value,
        sd:                                   this.characteristics.defenses.social.value,
        socialDefense:                        this.characteristics.defenses.social.value,
        ["socialDefense".toLowerCase()]:      this.characteristics.defenses.social.value,
      },
      // health values
      // damage/da/currentDamage, wounds/currentWounds, woundThreshold/wt/woundThresh,
      // unconscious/uncon/unconsciousnessRating, death/deathRating
      // stunDam/stunDamage/currentStunDamage
      // bloodDamage/currentBloodDamage, bloodWounds/currentBloodWounds
      {
        damage:                                  this.characteristics.health.damage.total,
        da:                                      this.characteristics.health.damage.total,
        currentDamage:                           this.characteristics.health.damage.total,
        ["currentDamage".toLowerCase()]:         this.characteristics.health.damage.total,
        wounds:                                  this.characteristics.health.wounds,
        currentWounds:                           this.characteristics.health.wounds,
        ["currentWounds".toLowerCase()]:         this.characteristics.health.wounds,
        woundThreshold:                          this.characteristics.health.woundThreshold,
        ["woundThreshold".toLowerCase()]:        this.characteristics.health.woundThreshold,
        wt:                                      this.characteristics.health.woundThreshold,
        woundThresh:                             this.characteristics.health.woundThreshold,
        ["woundThresh".toLowerCase()]:           this.characteristics.health.woundThreshold,
        unconscious:                             this.characteristics.health.unconscious,
        uncon:                                   this.characteristics.health.unconscious,
        unconsciousnessRating:                   this.characteristics.health.unconscious,
        ["unconsciousnessRating".toLowerCase()]: this.characteristics.health.unconscious,
        death:                                   this.characteristics.health.death,
        deathRating:                             this.characteristics.health.death,
        ["deathRating".toLowerCase()]:           this.characteristics.health.death,
        stunDam:                                 this.characteristics.health.damage.stun,
        ["stunDam".toLowerCase()]:               this.characteristics.health.damage.stun,
        stunDamage:                              this.characteristics.health.damage.stun,
        ["stunDamage".toLowerCase()]:            this.characteristics.health.damage.stun,
        currentStunDamage:                       this.characteristics.health.damage.stun,
        ["currentStunDamage".toLowerCase()]:     this.characteristics.health.damage.stun,
        bloodDamage:                             this.characteristics.health.bloodMagic.damage,
        ["bloodDamage".toLowerCase()]:           this.characteristics.health.bloodMagic.damage,
        currentBloodDamage:                      this.characteristics.health.bloodMagic.damage,
        ["currentBloodDamage".toLowerCase()]:    this.characteristics.health.bloodMagic.damage,
        bloodWounds:                             this.characteristics.health.bloodMagic.wounds,
        ["bloodWounds".toLowerCase()]:           this.characteristics.health.bloodMagic.wounds,
        currentBloodWounds:                      this.characteristics.health.bloodMagic.wounds,
        ["currentBloodWounds".toLowerCase()]:    this.characteristics.health.bloodMagic.wounds,
      },
      // movement values
      // burrow, climb, fly, swim, walk
      Object.fromEntries(
        Object.entries( this.characteristics.movement )
          .filter( ( [ _, value ] ) => value !== null )
          .map( ( [ key, value ] ) => [ key, value.value ] )
      ),
      // resources
      // karma/currentKarma, maxKarma/maximumKarma,
      // devotion/currentDevotion, maxDevotion/maximumDevotion,
      // recovery/recoveryStep, currentRecovery, maxRecovery/maximumRecovery
      {
        karma:                                this.karma.step,
        currentKarma:                         this.karma.step,
        ["currentKarma".toLowerCase()]:       this.karma.step,
        maxKarma:                             this.karma.max,
        ["maxKarma".toLowerCase()]:           this.karma.max,
        maximumKarma:                         this.karma.max,
        ["maximumKarma".toLowerCase()]:       this.karma.max,
        devotion:                             this.devotion.step,
        currentDevotion:                      this.devotion.step,
        ["currentDevotion".toLowerCase()]:    this.devotion.step,
        maxDevotion:                          this.devotion.max,
        ["maxDevotion".toLowerCase()]:        this.devotion.max,
        maximumDevotion:                      this.devotion.max,
        ["maximumDevotion".toLowerCase()]:    this.devotion.max,
        recovery:                             this.characteristics.recoveryTestsResource.step,
        recoveryStep:                         this.characteristics.recoveryTestsResource.step,
        ["recoveryStep".toLowerCase()]:       this.characteristics.recoveryTestsResource.step,
        currentRecovery:                      this.characteristics.recoveryTestsResource.value,
        ["currentRecovery".toLowerCase()]:    this.characteristics.recoveryTestsResource.value,
        maxRecovery:                          this.characteristics.recoveryTestsResource.max,
        ["maxRecovery".toLowerCase()]:        this.characteristics.recoveryTestsResource.max,
        maximumRecovery:                      this.characteristics.recoveryTestsResource.max,
        ["maximumRecovery".toLowerCase()]:    this.characteristics.recoveryTestsResource.max
      },
      // initiative step
      // ini/initiative/initiativeStep
      {
        ini:                                  this.initiative,
        initiative:                           this.initiative,
        initiativeStep:                       this.initiative,
        ["initiativeStep".toLowerCase()]:     this.initiative,
      },
    );
  }

  // endregion

  isAboutToDie( newDamageTotal ) {
    return !this.isDead
      && newDamageTotal >= this.characteristics.health.death;
  }

  // region Migrations

  /** @inheritDoc */
  static migrateData( source ) {
    super.migrateData( source );
    // specific migration functions
  }

  // endregion

}

