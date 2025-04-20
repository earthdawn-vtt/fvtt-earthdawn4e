import { ItemDataModel } from "../../abstract.mjs";
import AdvancementData from "../../advancement/base-advancement.mjs";
import LpIncreaseTemplate from "./lp-increase.mjs";
import LearnableTemplate from "./learnable.mjs";
import ClassAdvancementDialog from "../../../applications/advancement/class-advancement.mjs";
import ED4E from "../../../config/_module.mjs";

/**
 * Data model template with information on "class"-like items: paths, disciplines, and questors.
 * @property {number} level         either circle or rank of the class 
 * @property {string} identifier    type of class
 * @augments {ItemDataModel}
 * @augments {LearnableTemplate}
 * @augments {LpIncreaseTemplate}
 * @mixes LearnableTemplate
 * @mixes LpIncreaseTemplate
 */
export default class ClassTemplate extends ItemDataModel.mixin(
  LearnableTemplate,
  LpIncreaseTemplate
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Class",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      level: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "Class.level" ),
        hint:     this.hintKey( "Class.level" )
      } ),
      advancement: new fields.EmbeddedDataField(
        AdvancementData,
        {
          required: true,
          label:    "ED.advancement",
          hint:     "ED.advancementSchemaForThisClass"
        }
      )
    } );
  }

  /**
   * The tier of the current level. Returns an empty string if no level is found.
   * @type {string}
   */
  get currentTier() {
    return this.advancement?.levels[this.level - 1]?.tier ?? "";
  }

  /* -------------------------------------------- */
  /*  Legend Building                             */
  /* -------------------------------------------- */

  /** @inheritDoc */
  get canBeLearned() {
    return true;
  }

  /** @inheritDoc */
  get increasable() {
    return true;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  get learnable() {
    return true;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  get requiredLpForIncrease() {
    if ( this.parent.type !== "discipline" ) return 0;
    const nextLevel = this.level + 1;
    const disciplineSortingFactor = this.order - 1;
    const nextLevelTier = nextLevel === 0 ? "novice" : this.advancement.levels.find( l => l.level === nextLevel )?.tier;
    return ED4E.legendPointsCost[
      1 // new level
    + disciplineSortingFactor
    + ED4E.lpIndexModForTier[1][nextLevelTier]
    ];
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  get requiredLpToLearn() {
    return 0;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  // eslint-disable-next-line complexity
  async increase() {
    if ( !this.isActorEmbedded ) return;

    const nextLevel = this.level + 1;
    const nextLevelData = this.advancement.levels.find( l => l.level === nextLevel );
    if ( !nextLevelData ) {
      ui.notifications.warn( "ED.Notifications.Warn.NoMoreClassLevelsToIncrease" );
      return;
    }
    const nextTier = nextLevelData.tier;

    const { proceed, abilityChoice, spells} = await ClassAdvancementDialog.waitPrompt( this.parent );
    if ( !proceed ) return;

    // update the class first
    if ( !(
      ( await this.parent.update( { "system.level": nextLevel } ) ).system.level === nextLevel
    ) )
      ui.notifications.warn( "ED.Notifications.Warn.ClassIncreaseProblems" );


    // learn everything that potentially costs lp
    const systemSourceData = {
      system: {
        tier:   nextTier,
        source: {
          class:   this.parent.uuid,
          atLevel: nextLevel,
        },
        talentCategory: "discipline",
      },
    };

    const abilityChoiceItem = await fromUuid( abilityChoice );
    const learnedAbilityChoice = await abilityChoiceItem?.system?.constructor?.learn(
      this.containingActor,
      abilityChoiceItem,
      foundry.utils.mergeObject(
        systemSourceData,
        {
          "system.talentCategory": "optional",
          "system.tier":           nextTier,
        },
        { inplace: false },
      )
    );
    await learnedAbilityChoice?.system?.increase();


    for ( const spellUuid of spells ) {
      const spell = await fromUuid( spellUuid );
      await spell?.system?.constructor?.learn(
        this.containingActor,
        spell,
        systemSourceData,
      );
    }

    for ( const abilityUuid of nextLevelData.abilities.class ) {
      const ability = await fromUuid( abilityUuid );
      await ability?.system?.constructor?.learn(
        this.containingActor,
        ability,
        systemSourceData,
      );
    }

    // add everything that's free
    const freeAbilityData = await Promise.all(
      nextLevelData.abilities.free.map(
        async uuid => {
          const item = await fromUuid( uuid );
          return Object.assign(
            item?.toObject(),
            systemSourceData
          );
        }
      ) );

    const specialAbilityData = await Promise.all(
      nextLevelData.abilities.special.map( ability => fromUuid( ability ) )
    );

    const effects = Array.from( nextLevelData.effects );

    await this.containingActor.createEmbeddedDocuments( "Item", [ ...freeAbilityData, ...specialAbilityData ] );
    await this.containingActor.createEmbeddedDocuments( "ActiveEffect", effects );
    // TODO: activate permanent effects immediately

    // increase resource step of the discipline
    const highestDiscipline = this.containingActor.highestDiscipline;
    
    const resourceStep = nextLevelData.resourceStep;
    if ( this.parent.type === "discipline" && this.parent.id === highestDiscipline.id ) {
      await this.containingActor.update( { "system.karma.step": resourceStep } );
    } else if ( this.parent.type === "questor" ) {
      await this.containingActor.update( { "system.devotion.step": resourceStep } );
    }

    // increase all abilities of category "free" to new circle, if lower
    const freeAbilities = this.containingActor.items.filter(
      i => i.system.talentCategory === "free"
        && i.system.source?.class === this.parent.uuid
        && i.system.level < nextLevel
    );
    // TODO: check if there are any free abilities already on this level or higher
    // if so, add new earnings lp transaction to refund the spent lp to raise
    // the free talent

    for ( const ability of freeAbilities ) {
      await ability.update( { "system.level": nextLevel } );
    }

    // we only land here if the class increase was successful
    return this.parent;
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