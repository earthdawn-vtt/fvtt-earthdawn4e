import ED4E from "../../config.mjs";
import AbilityTemplate from "./templates/ability.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import KnackTemplate from "./templates/knack-item.mjs";

/**
 * Data model template with information on Knack items.
 * @property {string} sourceTalent          talent the knack is derived from
 * @property {string} restrictions          restrictions of the knack
 * @property {object} requirements          requirement of the knack
 * @property {boolean} standardEffect       standard effect used
 */
export default class KnackAbilityData extends AbilityTemplate.mixin(
  KnackTemplate,
  ItemDescriptionTemplate
)  {

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      isPathKnack: new fields.BooleanField( {
        required: true,
        initial:  false,
        label:    this.labelKey( "Knack.isPathKnack" ),
        hint:     this.hintKey( "Knack.isPathKnack" ),
      } ),
      standardEffect: new fields.BooleanField( {
        required: true,
        initial:  false,
        label:    this.labelKey( "Knack.standardEffect" ),
        hint:     this.hintKey( "Knack.standardEffect" ),
      } ),
    } );
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async _onCreate( data, options, user ) {
    if ( !await super._preCreate( data, options, user ) ) return false;
  }

  /**
   * @inheritDoc
   */
  get learnKnackRules() {
    return game.i18n.localize( "ED.Rules.knackShortRequirements" );
  }

  /**
   * @inheritDoc
   */
  get knackLernData() {
    if ( !this.isActorEmbedded ) return undefined;
    const actor = this.parent.actor;
  
    return {
      requiredLP:   this.requiredLpToLearn,
      hasDamage:    actor.hasDamage( "standard" ),
      hasWounds:    actor.hasWounds( "standard" ),
    };
  }

  /**
   * @inheritDoc
   */
  get requiredLpToLearn() {
    // Knack lp costs are equivalent to novice talents of the level equal to the minLevel
    if ( !this.lpCost ) {
      return ED4E.legendPointsCost[
        this.minLevel
      ];
    } else {
      return this.lpCost;
    }
  }

  /**
   * @inheritDoc
   */
  get requiredMoneyToLearn() {
    return  this.minLevel  * 50;
  }

  get learnKnackValidationData() {
    if ( !this.isActorEmbedded ) return undefined;

    const knackLernData = this.knackLernData;

    const baseFlavor = game.i18n.format( "ED.Dialogs.Legend.Validation.knackRequirements", {
      minLevel:         this.minLevel,
    } );

    const baseDaysToLearnFlavor = game.i18n.format( "ED.Dialogs.Legend.Validation.daysToLearnKnack", {
      days:            this.minLevel,
    } );

    return {
      [ED4E.validationCategories.base]:      [
        {
          name:      baseFlavor,
          value:     "",
          fulfilled: "fulfilled",
        },
        {
          name:      baseDaysToLearnFlavor,
          value:     "",
          fulfilled: "fulfilled",
        },
      ],
      [ED4E.validationCategories.resources]: [
        {
          name:      "ED.Dialogs.Legend.Validation.availableLp",
          value:     this.requiredLpToLearn,
          fulfilled: this.requiredLpToLearn <= this.parent.actor.currentLp,
        },
        {
          name:      "ED.Dialogs.Legend.Validation.availableMoney",
          value:     this.requiredMoneyToLearn,
          fulfilled: this.requiredMoneyToLearn <= this.parent.actor.currentSilver,
        },
      ],
      [ED4E.validationCategories.health]:    [
        {
          name:      "ED.Dialogs.Legend.Validation.hasDamage",
          value:     knackLernData.hasDamage,
          fulfilled: !knackLernData.hasDamage,
        },
        {
          name:      "ED.Dialogs.Legend.Validation.hasWounds",
          value:     knackLernData.hasWounds,
          fulfilled: !knackLernData.hasWounds,
        },
      ],
    };
  }

  /**
   * @inheritDoc
   */
  get canBeLearned() {
    return true;
    // return [ "pc", "npc" ].includes( this.parent.actor?.type );
  }

  static async learn( actor, item, createData = {} ) {
    const learnedItem = await super.learn( actor, item, createData );
    return learnedItem;
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