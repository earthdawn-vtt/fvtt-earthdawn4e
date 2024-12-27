import ClassTemplate from "./class.mjs";
import TargetTemplate from "./targeting.mjs";
import ActionTemplate from "./action.mjs";
import ED4E from "../../../config.mjs";
import LpIncreaseTemplate from "./lp-increase.mjs";
import LearnableTemplate from "./learnable.mjs";
import PromptFactory from "../../../applications/global/prompt-factory.mjs";
import LpSpendingTransactionData from "../../advancement/lp-spending-transaction.mjs";
const isEmpty = foundry.utils.isEmpty;

/**
 * Data model template with information on Ability items.
 * @property {string} attribute attribute
 * @property {object} source Class Source
 * @property {string} source.class class
 * @property {string} source.tier talent tier
 * @property {number} level rank
 * @mixes LearnableTemplate
 * @mixes LpIncreaseTemplate
 * @mixes TargetTemplate
 */
export default class AbilityTemplate extends ActionTemplate.mixin(
  LearnableTemplate,
  LpIncreaseTemplate,
  TargetTemplate
) {
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
      level: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "Ability.rank" ),
        hint:     this.hintKey( "Ability.rank" )
      } ),
      rollTypeDetails: new fields.SchemaField( {
        ability:       new fields.SchemaField( {}, {} ),
        attack:        new fields.SchemaField( {
          weaponItemStatus: new fields.StringField( {
            required: false,
            nullable: true,
            blank:    false,
            initial:  null,
            choices:  ED4E.itemStatus,
            label:    this.labelKey( "Ability.RollTypeDetails.Attack.weaponItemStatus" ),
            hint:     this.hintKey( "Ability.RollTypeDetails.Attack.weaponItemStatus" )
          } ),
        }, {
          required: false,
          label:    this.labelKey( "Ability.RollTypeDetails.attack" ),
          hint:     this.hintKey( "Ability.RollTypeDetails.attack" )
        } ),
        damage:        new fields.SchemaField( {}, {} ),
        effect:        new fields.SchemaField( {}, {} ),
        initiative:    new fields.SchemaField( {}, {} ),
        reaction:      new fields.SchemaField( {
          defenseType: new fields.StringField( {
            required: true,
            nullable: false,
            blank:    false,
            initial:  "physical",
            choices:  ED4E.targetDifficulty,
            label:    this.labelKey( "Ability.RollTypeDetails.Reaction.defenseType" ),
            hint:     this.hintKey( "Ability.RollTypeDetails.Reaction.defenseType" )
          } ),
        }, {
          required: false,
          label:    this.labelKey( "Ability.RollTypeDetails.reaction" ),
          hint:     this.hintKey( "Ability.RollTypeDetails.reaction" ),
        } ),
        recovery:      new fields.SchemaField( {}, {} ),
        spellcasting:  new fields.SchemaField( {}, {} ),
        threadWeaving: new fields.SchemaField( {}, {} ),
      }, {
        required: false,
        label:    this.labelKey( "Ability.rollTypeDetails" ),
        hint:     this.hintKey( "Ability.rollTypeDetails" )
      } ),
      damageAbilities: new fields.SchemaField( {
        damage: new fields.BooleanField( {
          required: false,
          nullable: false,
          initial:  false,
          label:    this.labelKey( "Ability.DamageAbilities.damage" ),
          hint:     this.hintKey( "Ability.DamageAbilities.damage" )
        } ),
        substitute: new fields.BooleanField( {
          required: false,
          nullable: false,
          initial:  false,
          label:    this.labelKey( "Ability.DamageAbilities.substitute" ),
          hint:     this.hintKey( "Ability.DamageAbilities.substitute" )
        } ),
        relatedRollType: new fields.StringField( {
          required: false,
          nullable: true,
          blank:    true,
          initial:  "",
          choices:  ED4E.rollTypes,
          label:    this.labelKey( "Ability.DamageAbilities.relatedRollType" ),
          hint:     this.hintKey( "Ability.DamageAbilities.relatedRollType" )
        } ),
      } ),
    } );
  }

  /* -------------------------------------------- */
  /*  Getters                   */
  /* -------------------------------------------- */

  /**
   * The final rank of the ability (attribute step + level).
   * @type {number}
   */
  get rankFinal() {
    return ( this.parentActor?.system.attributes[this.attribute]?.step ?? 0 ) + this.level;
  }

  /** @inheritDoc */
  get canBeLearned() {
    return true;
  }

  async adjustLevel( amount ) {
    const currentLevel = this.level;
    const updatedItem = await this.parent.update( {
      "system.level": currentLevel + amount,
    } );

    if ( isEmpty( updatedItem ) ) {
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.Legend.abilityIncreaseProblems" )
      );
      return;
    }

    return updatedItem;
  }

  /**
   * @inheritDoc
   */
  async increase() {
    if ( !this.isActorEmbedded ) return;

    const promptFactory = PromptFactory.fromDocument( this.parent );
    const spendLp = await promptFactory.getPrompt( "lpIncrease" );

    if ( !spendLp
      || spendLp === "cancel"
      || spendLp === "close" ) return;

    const currentLevel = this.level;

    const updatedItem = await this.parent.update( {
      "system.level": currentLevel + 1,
    } );

    if ( foundry.utils.isEmpty( updatedItem ) ) {
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.Legend.abilityIncreaseProblems" )
      );
      return;
    }

    const updatedActor = await this.parent.actor.addLpTransaction(
      "spendings",
      LpSpendingTransactionData.dataFromLevelItem(
        this.parent,
        spendLp === "spendLp" ? this.requiredLpForIncrease : 0,
        this.lpSpendingDescription,
      ),
    );

    if ( foundry.utils.isEmpty( updatedActor ) )
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.Legend.abilityIncreaseProblems" )
      );

    return this.parent;
  }

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
    if ( !createData?.system?.level ) itemData.system.level = 0;
    return ( await actor.createEmbeddedDocuments( "Item", [ itemData ] ) )?.[0];
  }

  /* -------------------------------------------- */
  /*                    Rolling                   */
  /* -------------------------------------------- */

  async rollAttack() {
    console.log( "Rolling attack" );
    if ( !this.isActorEmbedded ) return;

    // ed-id "second-weapon" for offhand weapons
    // don't forget to add tail attack
    const equippedWeapons = this.parentActor.equippedWeapons;
    console.log( "Equipped weapons: ", equippedWeapons );
    const attackType = !equippedWeapons ? "unarmed" : equippedWeapons[0].system.weaponType;
    console.log( "Attack type: ", attackType );
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