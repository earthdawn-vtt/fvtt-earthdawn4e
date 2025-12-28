import TargetTemplate from "./targeting.mjs";
import ActionTemplate from "./action.mjs";
import LearnableTemplate from "./learnable.mjs";
import PromptFactory from "../../../applications/global/prompt-factory.mjs";
import RollPrompt from "../../../applications/global/roll-prompt.mjs";
import AbilityRollOptions from "../../roll/ability.mjs";
import RollProcessor from "../../../services/roll-processor.mjs";
import CombatDamageWorkflow from "../../../workflows/workflow/damage-workflow.mjs";
import AttackWorkflow from "../../../workflows/workflow/attack-workflow.mjs";
import SiblingDocumentField from "../../fields/sibling-document-field.mjs";
import * as ACTIONS from "../../../config/actions.mjs";
import * as ACTORS from "../../../config/actors.mjs";
import * as ITEMS from "../../../config/items.mjs";
import * as LEGEND from "../../../config/legend.mjs";
import * as MAGIC from "../../../config/magic.mjs";
import * as SYSTEM from "../../../config/system.mjs";

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

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      attribute: new fields.StringField( {
        required: false,
        nullable: true,
        blank:    true,
        initial:  "",
        choices:  ACTORS.attributes,
      } ),
      tier: new fields.StringField( {
        nullable: false,
        blank:    true,
        choices:  LEGEND.tier,
        initial:  "",
      } ),
      source: new fields.SchemaField( {
        class:   new SiblingDocumentField(
          foundry.documents.Item,
          {
            systemTypes: [ ...SYSTEM.typeGroups.Item.classes, ],
          },
        ),
        atLevel: new fields.NumberField( {
          required: false,
          nullable: true,
          min:      0,
          integer:  true,
        } ),
      },
      {
        required: false,
      } ),
      rollTypeDetails: new fields.SchemaField( {
        ability:       new fields.SchemaField( {}, {} ),
        attack:        new fields.SchemaField( {
          weaponItemStatus: new fields.SetField(
            new fields.StringField( {
              required: true,
              blank:    false,
              choices:  ITEMS.itemStatus,
            } ),
            {
              required: true,
              initial:  [],
            }
          ),
          weaponTypes: new fields.SetField(
            new fields.StringField( {
              required: true,
              blank:    false,
              initial:  "melee",
              choices:  ITEMS.weaponType,
            } ),
            {
              required: true,
              initial:  [ "melee", ],
            },
          ),
        } ),
        damage:        new fields.SchemaField( {
          combatType: new fields.SetField( new fields.StringField( {
            required: true,
            nullable: true,
            blank:    false,
            choices:  ITEMS.weaponType,
          } ), {
            required: true,
            initial:  [],
          } ),
        }, {} ),
        effect:        new fields.SchemaField( {}, {} ),
        initiative:    new fields.SchemaField( {}, {} ),
        reaction:      new fields.SchemaField( {
          defenseType: new fields.StringField( {
            required: true,
            nullable: true,
            blank:    true,
            initial:  "physical",
            choices:  ACTIONS.targetDifficulty,
          } ),
        } ),
        recovery:      new fields.SchemaField( {}, {} ),
        spellcasting:  new fields.SchemaField( {}, {} ),
        threadWeaving: new fields.SchemaField( {
          castingType: new fields.StringField( {
            required: false,
            nullable: true,
            blank:    false,
            trim:     true,
            initial:  null,
            choices:  MAGIC.spellcastingTypes,
          } ),
        }, {} ),
      } ),
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Ability",
  ];

  // endregion

  // region Getters

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

  /**
   * Whether this ability is a replacement ability (i.e., it replaces an attribute step in a roll).
   * For this to be true, the ability must have no attribute assigned to it.
   * @returns {boolean} True if this is a replacement ability (no attribute set), false otherwise.
   */
  get isReplacementAbility() {
    return !!this.attribute;
  }

  // endregion

  // region LP Tracking

  async chooseTier( ) {
    const promptFactory = PromptFactory.fromDocument( this.parent );
    const tier = await promptFactory.getPrompt( "chooseTier" );

    if ( !tier || tier === "cancel" || tier === "close" ) return;

    const updatedItem = await this.parent.update( {
      "system.tier": tier,
    } );

    if ( foundry.utils.isEmpty( updatedItem ) && !this.schema.fields.tier.initial ) {
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.abilityIncreaseProblems" )
      );
      return;
    }

    return updatedItem;
  }

  // region LP Learning

  /** @inheritDoc */
  static async learn( actor, item, createData ) {
    return await super.learn( actor, item, createData );
  }

  // endregion

  // endregion

  // region Rolling

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

    const attackWorkflow = new AttackWorkflow(
      this.containingActor,
      {
        attackAbility: this.parentDocument,
        weapon:        weapon ?? undefined,
      },
    );

    return /** @type {EdRoll} */ attackWorkflow.execute();
  }

  async rollDamage() {
    if ( !this.isActorEmbedded ) return;

    const damageWorkflow = new CombatDamageWorkflow(
      this.containingActor,
      {
        sourceDocument:             this.parent,
        promptForModifierAbilities: false,
      },
    );

    return /** @type {EdRoll} */ damageWorkflow.execute();
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

    const attackWeaponTypes = this.rollTypeDetails.attack.weaponTypes;
    if ( attackWeaponTypes.has( "unarmed" ) ) return "_unarmed";

    const requiredWeaponStatus = this.rollTypeDetails.attack.weaponItemStatus;
    const requiredWeaponTypes = attackWeaponTypes;

    const weaponByStatus = equippedWeapons.find( weapon => requiredWeaponStatus.has( weapon.system.itemStatus ) );
    const weaponByType = equippedWeapons.find( weapon => requiredWeaponTypes.has( weapon.system.weaponType ) );

    if (
      // we need to check for the weapon  itself before comparing the uuids
      // otherwise if both are null, the comparison will return true
      weaponByStatus && weaponByType
      && ( weaponByStatus.uuid === weaponByType.uuid )
    ) return weaponByStatus;
    if ( !weaponByStatus && weaponByType ) return "_switchWeapon";
    return "_drawWeapon";
  }

  // endregion

  // region Migration

  /** @inheritDoc */
  static migrateData( source ) {
    super.migrateData( source );
    // specific migration functions
  }

  // endregion
}