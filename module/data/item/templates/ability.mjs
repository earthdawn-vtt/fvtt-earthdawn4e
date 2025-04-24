import ClassTemplate from "./class.mjs";
import TargetTemplate from "./targeting.mjs";
import ActionTemplate from "./action.mjs";
import ED4E from "../../../config/_module.mjs";
import LearnableTemplate from "./learnable.mjs";
import PromptFactory from "../../../applications/global/prompt-factory.mjs";
import RollPrompt from "../../../applications/global/roll-prompt.mjs";
import AttackRollOptions from "../../roll/attack.mjs";
import AbilityRollOptions from "../../roll/ability.mjs";

/**
 * Data model template with information on Ability items.
 * @property {string} attribute attribute
 * @property {object} source Class Source
 * @property {string} source.class class
 * @property {string} source.tier talent tier
 * @mixes LearnableTemplate
 * @mixes TargetTemplate
 */
export default class AbilityTemplate extends ActionTemplate.mixin(
  LearnableTemplate,
  TargetTemplate
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Ability",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      attribute: new fields.StringField( {
        required: false,
        nullable: true,
        blank:    true,
        initial:  "",
        choices:  ED4E.attributes,
        label:    this.labelKey( "Ability.attribute" ),
        hint:     this.hintKey( "Ability.attribute" )
      } ),
      tier: new fields.StringField( {
        nullable: false,
        blank:    false,
        choices:  ED4E.tier,
        initial:  "novice",
        label:    this.labelKey( "Ability.tier" ),
        hint:     this.hintKey( "Ability.tier" )
      } ),
      source: new fields.SchemaField( {
        class: new fields.DocumentUUIDField( ClassTemplate, {
          label:    this.labelKey( "Ability.Source.class" ),
          hint:     this.hintKey( "Ability.Source.class" )
        } ),
        atLevel: new fields.NumberField( {
          required: false,
          nullable: true,
          min:      0,
          integer:  true,
          label:    this.labelKey( "Ability.Source.atLevel" ),
          hint:     this.hintKey( "Ability.Source.atLevel" )
        } ),
      },
      {
        required: false,
        label:    this.labelKey( "Ability.Source.class" ),
        hint:     this.hintKey( "Ability.Source.class" )
      } ),
      rollTypeDetails: new fields.SchemaField( {
        ability:       new fields.SchemaField( {}, {} ),
        attack:        new fields.SchemaField( {
          weaponItemStatus: new fields.SetField(
            new fields.StringField( {
              required: true,
              blank:    false,
              choices:  ED4E.itemStatus,
            } ),
            {
              required: true,
              initial:  [],
              label:    this.labelKey( "Ability.RollTypeDetails.Attack.weaponItemStatus" ),
              hint:     this.hintKey( "Ability.RollTypeDetails.Attack.weaponItemStatus" )
            }
          ),
          weaponType: new fields.StringField( {
            required: true,
            blank:    false,
            initial:  "melee",
            choices:  ED4E.weaponType,
            label:    this.labelKey( "Ability.RollTypeDetails.Attack.weaponType" ),
            hint:     this.hintKey( "Ability.RollTypeDetails.Attack.weaponType" )
          } ),
        }, {
          label:    this.labelKey( "Ability.RollTypeDetails.attack" ),
          hint:     this.hintKey( "Ability.RollTypeDetails.attack" )
        } ),
        damage:        new fields.SchemaField( {}, {} ),
        effect:        new fields.SchemaField( {}, {} ),
        initiative:    new fields.SchemaField( {}, {} ),
        reaction:      new fields.SchemaField( {
          defenseType: new fields.StringField( {
            required: true,
            nullable: true,
            blank:    true,
            initial:  "physical",
            choices:  ED4E.targetDifficulty,
            label:    this.labelKey( "Ability.RollTypeDetails.Reaction.defenseType" ),
            hint:     this.hintKey( "Ability.RollTypeDetails.Reaction.defenseType" )
          } ),
        }, {
          label:    this.labelKey( "Ability.RollTypeDetails.reaction" ),
          hint:     this.hintKey( "Ability.RollTypeDetails.reaction" ),
        } ),
        recovery:      new fields.SchemaField( {}, {} ),
        spellcasting:  new fields.SchemaField( {}, {} ),
        threadWeaving: new fields.SchemaField( {
          castingType: new fields.StringField( {
            required: false,
            nullable: true,
            blank:    false,
            trim:     true,
            choices:  ED4E.spellcastingTypes,
            label:    this.labelKey( "Ability.Magic.magicType" ),
            hint:     this.hintKey( "Ability.Magic.magicType" )
          } ),
        }, {} ),
      }, {
        label:    this.labelKey( "Ability.rollTypeDetails" ),
        hint:     this.hintKey( "Ability.rollTypeDetails" )
      } ),
    } );
  }

  /* -------------------------------------------- */
  /*  Getters                   */
  /* -------------------------------------------- */

  get baseRollOptions() {
    const rollOptions = super.baseRollOptions;
    const abilityRollOptions = {
      rollingActorUuid: this.containingActor.uuid,
      abilityUuid:      this.parent.uuid,
      step:             {
        base:      this.rankFinal,
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
   * The type of spellcasting magic of this ability, if it is of type thread weaving.
   * Null if thread weaving of a non spellcasting discipline.
   * @type {string|null|undefined}
   * @see ED4E.spellcastingTypes
   */
  get castingType() {
    return this.rollType === "threadWeaving" ? this.rollTypeDetails.threadWeaving.castingType : undefined;
  }

  /**
   * The final rank of the ability (e.g. attribute + rank).
   * @type {number}
   */
  get rankFinal() {
    return ( this.containingActor?.system.attributes[this.attribute]?.step ?? 0 );
  }

  /** @inheritDoc */
  get canBeLearned() {
    return true;
  }

  /* -------------------------------------------- */
  /*  Legend                                      */
  /* -------------------------------------------- */

  async chooseTier( ) {
    const promptFactory = PromptFactory.fromDocument( this.parent );
    const tier = await promptFactory.getPrompt( "chooseTier" );

    if ( !tier || tier === "cancel" || tier === "close" ) return;

    const updatedItem = await this.parent.update( {
      "system.tier": tier,
    } );

    if ( foundry.utils.isEmpty( updatedItem ) && !this.schema.fields.tier.initial ) {
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.Legend.abilityIncreaseProblems" )
      );
      return;
    }

    return updatedItem;
  }

  /** @inheritDoc */
  static async learn( actor, item, createData ) {
    if ( !item.system.canBeLearned ) {
      ui.notifications.warn(
        game.i18n.format( "ED.Notifications.Warn.Legend.cannotLearn", {itemType: item.type} )
      );
      return;
    }
    const itemData = foundry.utils.mergeObject(
      item.toObject(),
      foundry.utils.expandObject( createData ),
    );
    return ( await actor.createEmbeddedDocuments( "Item", [ itemData ] ) )?.[0];
  }

  /* -------------------------------------------- */
  /*                    Rolling                   */
  /* -------------------------------------------- */

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
    return this.containingActor.processRoll( roll );
  }

  async rollAttack() {
    if ( !this.isActorEmbedded ) return;

    const equippedWeapons = this.containingActor.equippedWeapons;

    const whatToDo = this._checkEquippedWeapons( equippedWeapons );
    if ( !whatToDo ) throw new Error( "No action to take! Something's messed up :)" );

    let weapon = null;
    if ( whatToDo !== "_unarmed" ) {
      weapon = whatToDo.uuid ? whatToDo : null;
      weapon ??= await this[whatToDo]();
      if ( !weapon ) {
        ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.noWeaponToAttackWith" ) );
        return;
      }
    }

    const rollOptions = this.baseRollOptions;
    const rollOptionsUpdate = {
      ...rollOptions.toObject(),
      rollingActorUuid: this.containingActor.uuid,
      target:           { 
        tokens: game.user.targets.map( token => token.document.uuid ),
        base:   this.getDifficulty(),
      },
      weaponType:       this.rollTypeDetails.attack.weaponType,
      weaponUuid:       weapon?.uuid ?? null,
      chatFlavor:       "AbilityTemplate: ATTACK ROLL",
      rollType:         "attack", // for now just basic attack, later maybe `attack${ this.rollTypeDetails.attack.weaponType }`,
    };

    const roll = await RollPrompt.waitPrompt(
      new AttackRollOptions( rollOptionsUpdate ),
      {
        rollData: this.containingActor,
      }
    );
    return this.containingActor.processRoll( roll );
  }

  async _attack() {
    return true;
  }

  async _drawWeapon() {
    return this.containingActor.drawWeapon();
  }

  async _switchWeapon() {
    return this.containingActor.switchWeapon();
  }

  /**
   * Check if the character has the required weapon with the correct type equipped.
   * @param {ItemEd[]} equippedWeapons - An array of weapon items equipped by the character.
   * @returns {string} - The action to take or an empty string (which should not happen!).
   * @protected
   */
  _checkEquippedWeapons( equippedWeapons ) {

    if ( this.rollTypeDetails.attack.weaponType === "unarmed" ) return "_unarmed";

    const requiredWeaponStatus = this.rollTypeDetails.attack.weaponItemStatus;
    const requiredWeaponType = this.rollTypeDetails.attack.weaponType;

    const weaponByStatus = equippedWeapons.find( weapon => requiredWeaponStatus.has( weapon.system.itemStatus ) );
    const weaponByType = equippedWeapons.find( weapon => weapon.system.weaponType === requiredWeaponType );

    if (
      // we need to check for the weapon  itself before comparing the uuids
      // otherwise if both are null, the comparison will return true
      weaponByStatus && weaponByType
      && ( weaponByStatus.uuid === weaponByType.uuid )
    ) return weaponByStatus;
    if ( !weaponByStatus && weaponByType ) return "_switchWeapon";
    return "_drawWeapon";
  }


  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    super.migrateData( source );
    // specific migration functions
  }
}