 
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ED4E from "../../config/_module.mjs";
import KnackTemplate from "./templates/knack-item.mjs";
import PromptFactory from "../../applications/global/prompt-factory.mjs";
import IncreasableAbilityTemplate from "./templates/increasable-ability.mjs";
import MatrixTemplate from "./templates/matrix.mjs";
import AttributeMigration from "./migration/old-system-V082/attribute.mjs";
import ActionMigration from "./migration/old-system-V082/action.mjs";
import DescriptionMigration from "./migration/old-system-V082/description.mjs";
import DifficultyMigration from "./migration/old-system-V082/difficulty.mjs";
import LevelMigration from "./migration/old-system-V082/level.mjs";
import TierMigration from "./migration/old-system-V082/tier.mjs";

/**
 * Data model template with information on talent items.
 * @mixes ItemDescriptionTemplate
 */
export default class TalentData extends IncreasableAbilityTemplate.mixin(
  ItemDescriptionTemplate,
  MatrixTemplate,
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Talent",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      talentCategory: new fields.StringField( {
        required: true,
        blank:    true,
        initial:  "",
        trim:     true,
        choices:  ED4E.talentCategory,
      } ),
      knacks: new fields.SchemaField( {
        available: new fields.SetField(
          new fields.DocumentUUIDField( {
            required:        true,
            nullable:        false,
            validate:        ( value, _ ) => {
              if ( !fromUuidSync( value, {strict: false} )?.system?.hasMixin( KnackTemplate ) ) return false;
              return undefined; // undefined means do further validation
            },
            validationError:  "must be a knack type",
          } ),
          {
            required: true,
            nullable: false,
            initial:  [],
          }
        ),
        learned:   new fields.SetField(
          new fields.DocumentUUIDField( {
            required:        true,
            nullable:        false,
            validate:        ( value, _ ) => {
              if ( !fromUuidSync( value, {strict: false} )?.system?.hasMixin( KnackTemplate ) ) return false;
              return undefined; // undefined means do further validation
            },
            validationError:  "must be a knack type",
          } ),
          {
            required: true,
            nullable: false,
            initial:  [],
          }
        ),
      }, {
        nullable: false,
        initial:  { learned: [], available: [] },
      } )
    } );
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  static metadata = Object.freeze( foundry.utils.mergeObject( super.metadata, {
    hasLinkedItems: true,
  }, {inplace: false} ) );

  /* -------------------------------------------- */

  /** @inheritdoc */
  static _cleanData( source, options ) {
    if ( source?.knacks?.available ) {
      source.knacks.available = source.knacks.available.filter( knackUuid => !!fromUuidSync( knackUuid ) );
      if ( options ) options.source = source;
    }
  }

  /* -------------------------------------------- */
  /*  LP Tracking                                 */
  /* -------------------------------------------- */

  /**
   * @inheritDoc
   */
  get canBeIncreased() {
    return this.isActorEmbedded
      && Object.values(
        this.increaseValidationData
      ).every( Boolean );
  }

  /**
   * @inheritDoc
   */
  get canBeLearned() {
    return true;
    // return !foundry.utils.isEmpty( this.parent?.actor?.classes );
  }

  /**
   * @inheritDoc
   */
  get increaseData() {
    if ( !this.isActorEmbedded ) return undefined;
    const actor = this.containingActor;

    return {
      newLevel:   this.level + 1,
      requiredLp: this.requiredLpForIncrease,
      hasDamage:  actor.hasDamage( "standard" ),
      hasWounds:  actor.hasWounds( "standard" ),
    };
  }

  /**
   * @inheritDoc
   */
  get increaseRules() {
    return game.i18n.localize( "ED.Dialogs.Legend.Rules.talentIncreaseShortRequirements" );
  }

  /**
   * @inheritDoc
   */
  get requiredLpForIncrease() {
    if ( !this.isActorEmbedded ) return undefined;

    const actor = this.parent.actor;
    const sourceClass = fromUuidSync( this.source.class );

    // for talents which are not tied to any class (versatility or others)
    if ( !sourceClass ) {
      return ED4E.legendPointsCost[
        this.level
        + 1 // new level
        + ED4E.lpIndexModForTier[1][this.tier]
      ];
    }

    // each tier starts at the next value in the fibonacci sequence
    let tierModifier = ED4E.lpIndexModForTier[sourceClass.system.order][this.tier];

    if ( actor.isMultiDiscipline && this.level === 0 )
      return ED4E.multiDisciplineNewTalentLpCost[sourceClass.system.order][actor.minCircle];

    return ED4E.legendPointsCost[
      this.level
    + 1 // new level
    + ( tierModifier || 0 )
    ];
  }

  /**
   * @inheritDoc
   */
  get requiredMoneyForIncrease() {
    return 0;
  }

  /**
   * @inheritDoc
   */
  get increaseValidationData() {
    if ( !this.isActorEmbedded ) return undefined;

    const increaseData = this.increaseData;
    return {
      [ED4E.validationCategories.base]:      [
        {
          name:      "ED.Dialogs.Legend.Validation.maxLevel",
          value:     increaseData.newLevel,
          fulfilled: increaseData.newLevel <= game.settings.get( "ed4e", "lpTrackingMaxRankTalent" ),
        },
      ],
      [ED4E.validationCategories.resources]: [
        {
          name:      "ED.Dialogs.Legend.Validation.availableLp",
          value:     this.requiredLpForIncrease,
          fulfilled: this.requiredLpForIncrease <= this.parent.actor.currentLp,
        },
        {
          name:      "ED.Dialogs.Legend.Validation.availableMoney",
          value:     this.requiredMoneyForIncrease,
          fulfilled: this.requiredMoneyForIncrease <= this.parent.actor.currentSilver,
        },
      ],
      [ED4E.validationCategories.health]:    [
        {
          name:      "ED.Dialogs.Legend.Validation.hasDamage",
          value:     increaseData.hasDamage,
          fulfilled: !increaseData.hasDamage,
        },
        {
          name:      "ED.Dialogs.Legend.Validation.hasWounds",
          value:     increaseData.hasWounds,
          fulfilled: !increaseData.hasWounds,
        },
      ],
    };
  }

  /**
   * @inheritDoc
   */
  async increase() {
    return super.increase();
  }

  /** @inheritDoc */
  static async learn( actor, item, createData = {} ) {
    // dropping an item on the actor has no createData. This is only used when learning a
    // talent from the class increase. If talents are learned from the class, the
    // class defines category, tier, source discipline and the level it was learned at.
    const learnedItem = await super.learn( actor, item, createData );

    let category;
    let discipline;
    let learnedAt;

    // assign the category of the talent
    if ( !learnedItem.system.talentCategory ) {
      const promptFactoryItem = PromptFactory.fromDocument( learnedItem );
      category = await promptFactoryItem.getPrompt( "talentCategory" );
    }

    // assign the level at which the talent was learned and the source discipline
    if ( !learnedItem.system.source?.class ) {
      const promptFactoryActor = PromptFactory.fromDocument( actor );
      const disciplineUuid = await promptFactoryActor.getPrompt( "chooseDiscipline" );
      discipline = await fromUuid( disciplineUuid );
      learnedAt = discipline?.system.level;
    }

    // assign the tier of the talent
    if ( !learnedItem.system.tier ) {
      await learnedItem.system.chooseTier();
    }

    // update the learned talent with the new data
    await learnedItem.update( {
      "system.talentCategory":        category ?? learnedItem.system.talentCategory,
      "system.source.class":          learnedItem.system.source?.class ?? discipline,
      "system.source.atLevel":        learnedItem.system.source?.atLevel ?? learnedAt,
    } );
    
    return learnedItem;
  }

  /* -------------------------------------------- */
  /*  Socket Events                               */
  /* -------------------------------------------- */

  /** @inheritdoc */
  async _onCreate( data, options, user ) {
    if ( ( await super._preCreate( data, options, user ) ) === false ) return false;

    // assign the source talent
  }

  /* -------------------------------------------- */
  /*  Drop Events                                 */
  /* -------------------------------------------- */

  async _onDropKnack( event, document ) {
    const item = this.parent;
    await item.update( {
      "system.knacks.available": [ ...this.knacks.available, document.uuid ],
    } );
    const knack = await fromUuid( document.uuid );
    if ( !knack.system?.sourceTalent ) knack.update( {
      "system.sourceTalent": item.edid,
    } );
    return true;
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
   
  static migrateData( source ) {

    // Migrate action
    ActionMigration.migrateData( source );

    // Migrate Attributes
    AttributeMigration.migrateData( source );

    // Migrate description
    DescriptionMigration.migrateData( source );

    // Migrate minDifficulty (only if source.difficulty is not set)
    DifficultyMigration.migrateData( source );

    // Migrate level
    LevelMigration.migrateData( source );
    
    // // Migrate tier
    TierMigration.migrateData( source );

    // Migrate rollTypes healing
    if ( source.healing > 0 ) {
      source.rollType ??= "recovery";
    }

    // Migrate Talent category
    if ( source.talentCategory ) {
      if ( source.talentCategory?.slugify( { lowercase: true, strict: true } ) === "racial" ) {
        source.talentCategory = "free";
      } else {
        source.talentCategory = source.talentCategory.slugify( { lowercase: true, strict: true } );
      } 
    }
  }
}