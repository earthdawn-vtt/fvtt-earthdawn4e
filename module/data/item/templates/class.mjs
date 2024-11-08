import { ItemDataModel } from "../../abstract.mjs";
import AdvancementData from "../../advancement/base-advancement.mjs";
import LpIncreaseTemplate from "./lp-increase.mjs";
import LearnableTemplate from "./learnable.mjs";
import ClassAdvancementDialog from "../../../applications/advancement/class-advancement.mjs";

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
    return 0;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  get requiredLpToLearn() {
    return 0;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async increase() {
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
    await abilityChoiceItem?.system?.constructor?.learn(
      this.parentActor,
      abilityChoiceItem,
      foundry.utils.mergeObject(
        systemSourceData,
        { "system.talentCategory": "optional" },
        { inplace: false },
      )
    );

    for ( const spellUuid of spells ) {
      const spell = await fromUuid( spellUuid );
      await spell?.system?.constructor?.learn(
        this.parentActor,
        spell,
        systemSourceData,
      );
    }

    for ( const abilityUuid of nextLevelData.abilities.class ) {
      const ability = await fromUuid( abilityUuid );
      await ability?.system?.constructor?.learn(
        this.parentActor,
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

    await this.parentActor.createEmbeddedDocuments( "Item", [ ...freeAbilityData, ...specialAbilityData ] );
    await this.parentActor.createEmbeddedDocuments( "ActiveEffect", effects );
    // TODO: activate permanent effects immediately

    // increase resource step of the discipline
    const highestClass = this.parentActor.highestDiscipline;
    
    if ( this.parent.type === "discipline" && this.parent.id === highestClass.id ) {
      const resourceStep = nextLevelData.resourceStep;
      await this.parentActor.update( { "system.karma.step": resourceStep } );
    } else if ( this.parent.type === "questor" ) {
      const resourceStep = nextLevelData.resourceStep;
      await this.parentActor.update( { "system.devotion.step": resourceStep } );
    }

    // increase all abilities of category "free" to new circle, if lower
    const freeAbilities = this.parentActor.items.filter(
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