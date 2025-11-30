import ItemDescriptionTemplate from "./templates/item-description.mjs";
import KnackTemplate from "./templates/knack-item.mjs";
import PromptFactory from "../../applications/global/prompt-factory.mjs";
import IncreasableAbilityTemplate from "./templates/increasable-ability.mjs";
import MatrixTemplate from "./templates/matrix.mjs";
import DialogEd from "../../applications/api/dialog.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";
import * as LEGEND from "../../config/legend.mjs";
import SiblingDocumentField from "../fields/sibling-document-field.mjs";

const DialogClass = DialogEd;

/**
 * Data model template with information on talent items.
 * @mixes ItemDescriptionTemplate
 */
export default class TalentData extends IncreasableAbilityTemplate.mixin(
  ItemDescriptionTemplate,
  MatrixTemplate,
) {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      talentCategory: new fields.StringField( {
        required: true,
        blank:    true,
        initial:  "",
        trim:     true,
        choices:  LEGEND.talentCategory,
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
          new SiblingDocumentField(
            foundry.documents.Item,
            {
              systemTypes: [ SYSTEM_TYPES.Item.knackAbility, SYSTEM_TYPES.Item.knackKarma, SYSTEM_TYPES.Item.knackManeuver, ],
            },
          ),
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

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Talent",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      hasLinkedItems: true,
      type:           SYSTEM_TYPES.Item.talent,
    }, {
      inplace: false
    },
  ) );

  // endregion

  // region Static Methods

  /** @inheritdoc */
  static _cleanData( source, options ) {
    if ( source?.knacks?.available ) {
      source.knacks.available = source.knacks.available.filter( knackUuid => !!fromUuidSync( knackUuid ) );
      if ( options ) options.source = source;
    }
  }

  // endregion

  // region Getters

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
      newLevel:   this.unmodifiedLevel + 1,
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

    const actor = this.containingActor;
    const sourceClass = actor.items.get( this.source?.class );

    // for talents which are not tied to any class (versatility or others)
    if ( !sourceClass ) {
      return LEGEND.legendPointsCost[
        this.unmodifiedLevel
        + 1 // new level
        + LEGEND.lpIndexModForTier[1][this.tier]
      ];
    }

    // each tier starts at the next value in the fibonacci sequence
    let tierModifier = LEGEND.lpIndexModForTier[sourceClass.system.order][this.tier];

    if ( actor.isMultiDiscipline && this.unmodifiedLevel === 0 )
      return LEGEND.multiDisciplineNewTalentLpCost[sourceClass.system.order][actor.minCircle];

    return LEGEND.legendPointsCost[
      this.unmodifiedLevel
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
      [LEGEND.validationCategories.base]:      [
        {
          name:      "ED.Dialogs.Legend.Validation.maxLevel",
          value:     increaseData.newLevel,
          fulfilled: increaseData.newLevel <= game.settings.get( "ed4e", "lpTrackingMaxRankTalent" ),
        },
      ],
      [LEGEND.validationCategories.resources]: [
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
      [LEGEND.validationCategories.health]:    [
        {
          name:      "ED.Dialogs.Legend.Validation.hasDamage",
          value:     increaseData.hasDamage ? game.i18n.localize( "ED.Dialogs.Legend.Validation.hasDamage" ) : game.i18n.localize( "ED.Dialogs.Legend.Validation.hasNoDamage" ),
          fulfilled: !increaseData.hasDamage,
        },
        {
          name:      "ED.Dialogs.Legend.Validation.hasWounds",
          value:     increaseData.hasWounds ? game.i18n.localize( "ED.Dialogs.Legend.Validation.hasWounds" ) : game.i18n.localize( "ED.Dialogs.Legend.Validation.hasNoWounds" ),
          fulfilled: !increaseData.hasWounds,
        },
      ],
    };
  }

  // endregion

  // region LP Tracking

  /**
   * @inheritDoc
   */
  async increase() {
    return super.increase();
  }

  // region Learning

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

    // versatility validation
    if ( category === "versatility" ) {
      const versatilityTalents = actor.itemTypes.talent.filter(
        item =>  item.system.talentCategory === "versatility"
      );
      const versatility = actor?.getSingleItemByEdid( "versatility" );
      if ( versatilityTalents.length >= versatility?.system.level ) {
        const progressRequest  = await DialogClass.confirm( {
          content: `<p>${ game.i18n.localize( "ED.Dialogs.versatilityTalentLimit" ) }</p>`,
          window:      {
            title:       game.i18n.format( "ED.Dialogs.Title.versatilityLimit" ),
          },
        } );
        if ( !progressRequest ) {
          return;
        }
      }
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
      "system.source.class":          learnedItem.system.source?.class ?? discipline?.id,
      "system.source.atLevel":        learnedItem.system.source?.atLevel ?? learnedAt,
    } );
    
    return learnedItem;
  }

  // endregion

  // endregion

  // region Life Cycle Events

  /** @inheritdoc */
  async _preCreate( data, options, user ) {
    if ( await super._preCreate( data, options, user ) === false ) return false;

    this._prepareMatrixData( data );

    this.updateSource( data );
  }

  /** @inheritdoc */
  async _preUpdate( changed, options, user ) {
    if ( await super._preUpdate( changed, options, user ) === false ) return false;

    this._prepareMatrixData( changed );
  }

  // endregion

  // region Drag and Drop

  async _onDropKnack( event, document ) {
    const item = this.parent;
    await item.update( {
      "system.knacks.available": [ ...this.knacks.available, document.uuid ],
    } );
    const knack = await fromUuid( document.uuid );
    if ( !knack.system?.sourceItem ) knack.update( {
      "system.sourceItem": item.edid,
    } );
    return true;
  }

  // endregion

  // region Rolling

  /** @inheritDoc */
  getRollData() {
    const rollData = super.getRollData();
    Object.assign( rollData, super.getTemplatesRollData() );
    return Object.assign( rollData, {} );
  }

  // endregion

}