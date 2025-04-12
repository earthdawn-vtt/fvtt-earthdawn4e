import ClassTemplate from "./templates/class.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ED4E from "../../config/_module.mjs";
import { linkForUuidSync } from "../../utils.mjs";

const { expandObject, isEmpty, mergeObject } = foundry.utils;

/**
 * Data model template with information on discipline items.
 * @property {number} durability durability value
 */
export default class DisciplineData extends ClassTemplate.mixin(
  ItemDescriptionTemplate
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Discipline",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      durability: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "Class.durability" ),
        hint:     this.hintKey( "Class.durability" )
      } ),
      // identifier for additional disciplines
      order: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      1,
        initial:  1,
        positive: true,
        integer:  true,
        label:    this.labelKey( "Class.order" ),
        hint:     this.hintKey( "Class.order" )
      } ),
      spellcasting: new fields.BooleanField( {
        required: true,
        initial:  false,
        label:    this.labelKey( "Class.spellcasting" ),
        hint:     this.hintKey( "Class.spellcasting" )
      } ),
    } );
  }

  /* -------------------------------------------- */
  /*  LP Tracking                                 */
  /* -------------------------------------------- */

  /** @inheritDoc */
  get increaseData() {
    const nextLevel = this.level + 1;
    let talentRequirements = [];

    switch ( game.settings.get( "ed4e", "lpTrackingCircleTalentRequirements" ) ) {
      case "disciplineTalents": {
        talentRequirements.push( ...this._talentRequirementsStandard );
        break;
      }
      case "allTalents": {
        talentRequirements.push( ...this._talentRequirementsOptional );
        break;
      }
      case "allTalentsHouseRule": {
        talentRequirements.push( ...this._talentRequirementsHouseRule );
        break;
      }
    }

    return {
      learn:            this.level === 0,
      nextLevel,
      nextLevelData:    this.advancement.levels.find( l => l.level === nextLevel ),
      nextTalentLpCost: ED4E.legendPointsCost[ nextLevel + ED4E.lpIndexModForTier[ this.currentTier ] ],
      talentRequirements,
    };
  }

  /**
   * @inheritDoc
   */
  get increaseRules() {
    return game.i18n.localize( "ED.Rules.disciplineIncreaseShortRequirements" );
  }

  /** @inheritDoc */
  get increaseValidationData() {
    if ( !this.isActorEmbedded ) return undefined;

    const { learn, nextTalentLpCost, talentRequirements } = this.increaseData;
    const validationData = {
      [ED4E.validationCategories.resources]:               [
        {
          name:      "ED.Dialogs.Legend.Validation.availableLp",
          value:     this.requiredLpForIncrease,
          fulfilled: this.requiredLpForIncrease <= this.parentActor.currentLp,
        },
        {
          name:      "ED.Dialogs.Legend.Validation.availableMoney",
          value:     this.requiredMoneyForIncrease,
          fulfilled: this.requiredMoneyForIncrease <= this.parent.actor.currentSilver,
        },
      ],
      [ED4E.validationCategories.talentsRequirement]: talentRequirements,
    };
    if ( !learn ) validationData[ED4E.validationCategories.newAbilityLp] = [
      {
        name:      "ED.Dialogs.Legend.Validation.talentOptionLp",
        value:     this.requiredLpForIncrease,
        fulfilled: nextTalentLpCost <= this.parentActor.currentLp,
      },
    ];
    return validationData;
  }

  /** @inheritDoc */
  get learnRules() {
    return game.i18n.localize( "ED.Dialogs.Legend.Rules.disciplineLearnShortRequirements" );
  }

  /** @inheritDoc */
  get requiredMoneyForIncrease() {
    return ED4E.disciplineTeacherCost[ this.level + 1 ];
  }

  /**
   * Get all talents from the discipline associated with this item.
   * @type {ItemEd[]}
   */
  get talentsFromDiscipline() {
    return this.parentActor.itemTypes.talent.filter(
      talent => talent.system.source.class === this.parent.uuid
    );
  }

  get _talentRequirementsStandard() {
    const nextLevel = this.level + 1;
    const disciplineTalents = this.getTalentsByCategory( "discipline" );
    const unfulfilledTalents = disciplineTalents.filter( talent => talent.system.level < nextLevel );
    const fulfilled = unfulfilledTalents.length === 0;
    const requirementValue = game.i18n.format(
      `ED.Dialogs.Legend.Validation.${
        fulfilled
          ? "talentsRequirementFulfilled"
          : "talentsRequirementFailed"
      }`,
      {
        requiredLevel:      nextLevel,
        unfulfilledTalents: unfulfilledTalents.map(
          talent => linkForUuidSync( talent.uuid )
        ).join( "\n" ),
      }
    );
    return [
      {
        name:      ED4E.circleTalentRequirements[
          game.settings.get( "ed4e", "lpTrackingCircleTalentRequirements" )
        ],
        value:     requirementValue,
        fulfilled,
      }
    ];
  }

  get _talentRequirementsOptional() {
    const nextLevel = this.level + 1;
    const allCorrespondingTalents = this.talentsFromDiscipline.filter(
      talent => talent.system.talentCategory !== "free"
    );

    // check if there is a talent from the current circle on the new level
    const talentsFromCurrentCircle = allCorrespondingTalents.filter(
      talent => talent.system.source.atLevel === this.level
    );
    const hasTalentFromCurrentCircle = talentsFromCurrentCircle.some(
      talent => talent.system.level === nextLevel
    );

    // check if there are enough talents on the minimum rank
    const talentsOnMinRank = allCorrespondingTalents.filter(
      talent => talent.system.level >= nextLevel <= 11 ? nextLevel : nextLevel - 1
    );
    const numTalentsOnMinRank = talentsOnMinRank.length;
    const numTalentsRequired = nextLevel + 3;
    const hasEnoughTalents = numTalentsOnMinRank >= numTalentsRequired;

    return [
      {
        name:      "ED.Dialogs.Legend.Validation.hasTalentFromCurrentCircle",
        value:     game.i18n.format(
          hasTalentFromCurrentCircle
            ? "ED.Dialogs.Legend.Validation.talentFromCurrentCircleOnNewLevel"
            : "ED.Dialogs.Legend.Validation.noTalentFromCurrentCircleOnNewLevel",
          { nextLevel },
        ),
        fulfilled: hasTalentFromCurrentCircle,
      },
      {
        name:      "ED.Dialogs.Legend.Validation.hasTalentsOnMinRank",
        value:     game.i18n.format(
          hasEnoughTalents
            ? "ED.Dialogs.Legend.Validation.enoughTalentsOnMinRank"
            : "ED.Dialogs.Legend.Validation.notEnoughTalentsOnMinRank",
          {
            required: numTalentsRequired,
            current:  numTalentsOnMinRank,
            nextLevel,
          }
        ),
        fulfilled: hasEnoughTalents,
      },
    ];
  }

  get _talentRequirementsHouseRule() {
    const nextLevel = this.level + 1;
    const tierInfos = {
      novice:     this.getTalentsByTier( "novice" ),
      journeyman: this.getTalentsByTier( "journeyman" ),
      warden:     this.getTalentsByTier( "warden" ),
      master:     this.getTalentsByTier( "master" ),
    };
    const minTalentsPerTier = {
      novice:     Math.min( this.level + 4, 8 ),
      journeyman: Math.min( this.level >= 6 ? this.level - 5 : 0, 4 ),
      warden:     Math.min( this.level >= 10 ? this.level - 9 : 0, 4 ),
      master:     Math.min( this.level >= 14 ? this.level - 13 : 0, 2 ),
    };

    const hasRequiredNoviceTalents = tierInfos.novice.length >= minTalentsPerTier.novice;
    const hasRequiredJourneymanTalents = tierInfos.journeyman.length >= minTalentsPerTier.journeyman;
    const hasRequiredWardenTalents = tierInfos.warden.length >= minTalentsPerTier.warden;
    const hasRequiredMasterTalents = tierInfos.master.length >= minTalentsPerTier.master;

    const hasTalentFromCurrentCircle = this.talentsFromDiscipline.some(
      talent =>
        talent.system.source.atLevel === this.level
        && talent.system.level === nextLevel
    );

    return [
      {
        name:  "ED.Dialogs.Legend.Validation.hasRequiredNoviceTalents",
        value: game.i18n.format(
          hasRequiredNoviceTalents
            ? "ED.Dialogs.Legend.Validation.enoughTalentsOfTier"
            : "ED.Dialogs.Legend.Validation.notEnoughTalentsOfTier",
          { required: minTalentsPerTier.novice, current: tierInfos.novice.length, nextLevel }
        ),
        fulfilled: hasRequiredNoviceTalents,
      },
      {
        name:  "ED.Dialogs.Legend.Validation.hasRequiredJourneymanTalents",
        value: game.i18n.format(
          hasRequiredJourneymanTalents
            ? "ED.Dialogs.Legend.Validation.enoughTalentsOfTier"
            : "ED.Dialogs.Legend.Validation.notEnoughTalentsOfTier",
          { required: minTalentsPerTier.journeyman, current: tierInfos.journeyman.length, nextLevel }
        ),
        fulfilled: hasRequiredJourneymanTalents,
      },
      {
        name:  "ED.Dialogs.Legend.Validation.hasRequiredWardenTalents",
        value: game.i18n.format(
          hasRequiredWardenTalents
            ? "ED.Dialogs.Legend.Validation.enoughTalentsOfTier"
            : "ED.Dialogs.Legend.Validation.notEnoughTalentsOfTier",
          { required: minTalentsPerTier.warden, current: tierInfos.warden.length, nextLevel }
        ),
        fulfilled: hasRequiredWardenTalents,
      },
      {
        name:  "ED.Dialogs.Legend.Validation.hasRequiredMasterTalents",
        value: game.i18n.format(
          hasRequiredMasterTalents
            ? "ED.Dialogs.Legend.Validation.enoughTalentsOfTier"
            : "ED.Dialogs.Legend.Validation.notEnoughTalentsOfTier",
          { required: minTalentsPerTier.master, current: tierInfos.master.length, nextLevel }
        ),
        fulfilled: hasRequiredMasterTalents,
      },
      {
        name:  "ED.Dialogs.Legend.Validation.hasTalentFromCurrentCircle",
        value: game.i18n.format(
          hasTalentFromCurrentCircle
            ? "ED.Dialogs.Legend.Validation.talentFromCurrentCircleOnNewLevel"
            : "ED.Dialogs.Legend.Validation.noTalentFromCurrentCircleOnNewLevel",
          { nextLevel }
        ),
        fulfilled: hasTalentFromCurrentCircle,
      },
    ];
  }

  /**
   * Get all talents associated with this discipline that are of the given category.
   * @param {keyof typeof ED4E.talentCategory} category   The category to filter for.
   * @returns {ItemEd[]}                                  The talents of the given category.
   */
  getTalentsByCategory( category ) {
    return this.talentsFromDiscipline.filter( talent => talent.system.talentCategory === category );
  }

  /**
   * Get all talents associated with this discipline that are of the given tier.
   * @param {keyof typeof ED4E.tier} tier   The tier to filter for.
   * @returns {ItemEd[]}                    The talents of the given tier.
   */
  getTalentsByTier( tier ) {
    return this.talentsFromDiscipline.filter( talent => talent.system.tier === tier );
  }

  /** @inheritDoc */
  static async learn( actor, item, createData ) {
    if ( !item.system.canBeLearned ) {
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.Legend.cannotLearn" ) );
      return;
    }
    if ( isEmpty( actor.disciplines ) ) {
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.Legend.firstDisciplineViaCharGen" ) );
      return;
    }

    const disciplineItemData = item.toObject();
    disciplineItemData.system.level = 0;
    disciplineItemData.system.order = actor.disciplines.length + 1;
    mergeObject(
      disciplineItemData,
      expandObject( createData ),
      {
        inplace: true
      },
    );

    const learnedDiscipline = ( await actor.createEmbeddedDocuments( "Item", [ disciplineItemData ] ) )?.[0];
    if ( !learnedDiscipline ) throw new Error(
      "Error learning discipline item. Could not create embedded Items."
    );

    learnedDiscipline.system.increase();

    return learnedDiscipline;
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