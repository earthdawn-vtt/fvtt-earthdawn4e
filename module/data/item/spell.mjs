import ItemDescriptionTemplate from "./templates/item-description.mjs";
import LearnableTemplate from "./templates/learnable.mjs";
import ED4E from "../../config/_module.mjs";
import LearnSpellPrompt from "../../applications/advancement/learn-spell.mjs";
import TargetTemplate from "./templates/targeting.mjs";
import { AreaMetricData, DurationMetricData, MetricData, RangeMetricData } from "../common/metrics.mjs";
import ItemDataModel from "../abstract/item-data-model.mjs";
import { SelectExtraThreadsPrompt } from "../../applications/workflow/_module.mjs";
import ThreadWeavingRollOptions from "../roll/weaving.mjs";
import { RollPrompt } from "../../applications/global/_module.mjs";
import SpellcastingRollOptions from "../roll/spellcasting.mjs";


const { fields } = foundry.data;

/**
 * Data model template with information on Spell items.
 * @mixes LearnableTemplate
 */
export default class SpellData extends ItemDataModel.mixin(
  ItemDescriptionTemplate,
  LearnableTemplate,
  TargetTemplate
)  {

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Spell",
  ];

  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
      spellcastingType: new fields.StringField( {
        required: true,
        nullable: false,
        blank:    false,
        trim:     true,
        choices:  ED4E.spellcastingTypes,
        initial:  "elementalism",
      } ),
      level: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      1,
        initial:  1,
        integer:  true,
        positive: true,
      } ),
      spellDifficulty:    new fields.SchemaField( {
        reattune: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      ED4E.minDifficulty,
          initial:  ( data ) => { return data.weaving + 5 || ED4E.minDifficulty; },
          integer:  true,
        } ),
        weaving: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      ED4E.minDifficulty,
          initial:  ( _ ) => { return this.parent?.parent?.fields?.level?.initial + 4 || ED4E.minDifficulty; },
          integer:  true,
        } ),
      } ),
      threads: new fields.SchemaField( {
        required: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        woven: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        extra: new fields.ArrayField( new fields.TypedSchemaField(
          MetricData.TYPES,
        ),{
          required: true,
          initial:  [],
        } ),
      } ),
      effect: new fields.StringField( {
        required: true,
        blank:    true,
        initial:  "",
      } ),
      keywords: new fields.SetField( new fields.StringField( {
        required: true,
        nullable: false,
        blank:    false,
        trim:     true,
        choices:  ED4E.spellKeywords,
      } ), {
        required: true,
        nullable: false,
        initial:  [],
      } ),
      element: new fields.SchemaField( {
        type: new fields.StringField( {
          required: true,
          nullable: true,
          blank:    false,
          trim:     true,
          choices:  ED4E.elements,
        } ),
        subtype: new fields.StringField( {
          required: true,
          nullable: true,
          blank:    false,
          trim:     true,
          choices:  Object.values(
            ED4E.elementSubtypes
          ).map(
            subtypes => Object.keys( subtypes )
          ).flat(),
        } )
      },
      {
        required: true,
        nullable: true,
      } ),
      duration: new fields.EmbeddedDataField( DurationMetricData, {
      } ),
      range:    new fields.EmbeddedDataField( RangeMetricData, {
      } ),
      area: new fields.EmbeddedDataField( AreaMetricData, {
      } ),
      extraSuccess: new fields.ArrayField( new fields.TypedSchemaField( MetricData.TYPES, {
      } ),
      {
        required: true,
        nullable: true,
        initial:  [],
        max:      1,
      } ),
      extraThreads: new fields.ArrayField( new fields.TypedSchemaField( MetricData.TYPES, {
      } ),
      {
        required: true,
        nullable: true,
        initial:  [],
      } ),
      isWeaving: new fields.BooleanField( {
        required: true,
        nullable: false,
        initial:  false,
      } ),
    } );
  }


  /**
   * @inheritDoc
   */
  static _validateJoint( value ) {
    if ( value?.element?.type ) {
      const elemType = value.element.type;
      const elemSubtype = value.element.subtype;

      // subtype is optional
      if ( !elemSubtype ) return undefined;

      if ( !Object.keys( ED4E.elementSubtypes[ elemType ] ).includes( elemSubtype ) )
        throw new Error( game.i18n.format( "ED.Notifications.Error.invalidElementSubtype" ) );
    }

    // continue validation
    return undefined;
  }

  // endregion

  // region Properties

  /**
   * @description Whether this spell is an illusion and therefore can be sensed.
   * @type {boolean}
   */
  get isIllusion() {
    return this.keywords.has( "illusion" );
  }

  /**
   * Is this spell ready to be cast?
   * @returns {boolean} True if the spell is weaving and has all required threads, false otherwise.
   */
  get isWeavingComplete() {
    return this.isWeaving && this.wovenThreads >= this.totalRequiredThreads;
  }

  /**
   * @description The difficulty number to dispel this spell.
   * @type {number}
   */
  get dispelDifficulty() {
    return this.level + 10;
  }

  /**
   * How many threads are missing to cast this spell.
   * @type {number}
   */
  get missingThreads() {
    return Math.max( 0, this.totalRequiredThreads - this.wovenThreads );
  }

  /**
   * How many extra threads should be woven for this spell.
   * @type {number}
   */
  get numChosenExtraThreads() {
    return this.threads.extra?.length || 0;
  }

  /**
   * @description The difficulty number to sense this spell, if it is an illusion, else undefined.
   * @type { number | undefined }
   */
  get sensingDifficulty() {
    return this.isIllusion ? this.level + 15 : undefined;
  }

  /**
   * The total number of threads required to cast this spell, including extra threads.
   * @type {number}
   */
  get totalRequiredThreads() {
    return this.threads.required + this.numChosenExtraThreads;
  }

  /**
   * The number of threads that have been woven for this spell.
   * @type {number}
   */
  get wovenThreads() {
    return this.threads.woven;
  }

  // endregion

  // region Methods

  // region LP Tracking

  /** @inheritDoc */
  get canBeLearned() {
    return true;
  }

  /**
   * @description The difficulty number to learn this spells. Equals the level of the spell plus 5.
   * @type {number}
   */
  get learningDifficulty() {
    return this.level + 5;
  }

  /** @inheritDoc */
  get requiredLpToLearn() {
    switch ( game.settings.get( "ed4e", "lpTrackingSpellCost" ) ) {
      case "noviceTalent": return ED4E.legendPointsCost[ this.level ];
      case "circleX100": return this.level * 100;
      case "free":
      default: return 0;
    }
  }

  /** @inheritDoc */
  static async learn( actor, item, createData = {} ) {
    const learn = await LearnSpellPrompt.waitPrompt( {
      actor: actor,
      spell: item,
    } );

    if ( !learn || learn === "cancel" || learn === "close" ) return;

    const learnedItem = await super.learn( actor, item, createData );

    const updatedActor = await actor.addLpTransaction(
      "spendings",
      {
        amount:      learn === "spendLp" ? item.system.requiredLpToLearn : 0,
        description: game.i18n.format(
          "ED.Actor.LpTracking.Spendings",
        ),
        entityType:  learnedItem.type,
        name:       learnedItem.name,
        itemUuid:   learnedItem.uuid,
      },
    );

    if ( foundry.utils.isEmpty( updatedActor ) )
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.addLpTransactionProblems" )
      );

    return learnedItem;
  }

  // endregion

  // region Spellcasting

  async cast( caster, spellcastingAbility ) {
    if ( !this.isWeavingComplete ) {
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.spellNotReadyToCast" ) );
      return;
    }

    const spellcastingRollOptions = SpellcastingRollOptions.fromActor(
      {
        spell:               this.parent.uuid,
        spellcastingAbility: spellcastingAbility.uuid,
      },
      caster,
    );

    const roll = await RollPrompt.waitPrompt(
      spellcastingRollOptions,
      {
        rollData: this.containingActor.getRollData(),
      },
    );
    await roll.toMessage();

    await this.parent.update( {
      "system.isWeaving":     false,
      "system.threads.woven": 0,
      "system.threads.extra": [],
    } );

    return roll;
  }

  /**
   * Set woven threads to zero and empty the chosen extra threads.
   * @returns {Promise<ItemEd|undefined>} Returns the updated spell item or undefined if not updated.
   */
  async resetThreads() {
    return await this.parent.update( {
      "system.threads.woven": 0,
      "system.threads.extra": [],
    } );
  }

  /**
   * Stop the weaving process for this spell, resetting all threads.
   * @returns {Promise<ItemEd|undefined>} Returns the updated spell item or undefined if not updated.
   */
  async stopWeaving() {
    // We're not calling resetThreads here to avoid unnecessary updates
    return await this.parent.update( {
      "system.isWeaving":     false,
      "system.threads.woven": 0,
      "system.threads.extra": [],
    } );
  }

  /**
   * Weave threads for this spell using the given ability and matrix. If the spell already has all necessary threads,
   * this does nothing.
   * @param {ItemEd} threadWeavingAbility The ability used for weaving threads to this spell.
   * @param {ItemEd} [matrix] The matrix this spell is attuned to, if any.
   * @returns {Promise<EdRoll|undefined>} Returns the roll made for weaving threads, or undefined if no roll was made.
   */
  async weaveThreads( threadWeavingAbility, matrix ) {
    let system = this;
    if ( matrix && !matrix?.system?.canWeave() ) {
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.matrixBrokenCannotWeave" ) );
      return;
    }

    if ( !this.isWeaving ) {
      const chosenExtraThreads = await SelectExtraThreadsPrompt.waitPrompt( {
        spell:  this.parent,
        caster: this.containingActor,
      } );
      await this.parent.update( {
        "system.isWeaving":     true,
        "system.threads.extra": chosenExtraThreads || [],
        "system.threads.woven": matrix?.system?.matrix?.threads?.hold?.value || 0,
      } );
      // cspell:disable-next-line
      // Quote Zhell on Discord: "Embedded data models (of which the TypeDataModel kind of is one) are reinstantiated entirely each update"
      system = this.parent.system;
    }

    if ( system.missingThreads > 0 ) {
      const abilityRollOptions = threadWeavingAbility.system.baseRollOptions;
      const weavingRollOptions = new ThreadWeavingRollOptions( {
        ...abilityRollOptions,
        target: {
          base:      system.spellDifficulty.weaving,
          modifiers: {},
          public:    true,
        },
        rollType:   "threadWeaving",
        spellUuid:  system.parent.uuid,
        threads:    {
          required: system.threads.required,
          extra:    system.numChosenExtraThreads,
        },
      } );

      const roll = await RollPrompt.waitPrompt(
        weavingRollOptions,
        {
          rollData: system.containingActor.getRollData(),
        },
      );
      await roll.toMessage();

      if ( roll?.numSuccesses > 0 ) {
        const wovenThreads = Math.min(
          system.totalRequiredThreads,
          system.wovenThreads + roll.numSuccesses
        );
        await this.parent.update( {
          "system.threads.woven": wovenThreads,
        } );
      }

      return roll;
    }
  }

  // endregion

  getAttunedMatrix() {
    return this.containingActor?.items.find( item => {
      return item.system.matrix?.spells.has( this.parent.uuid );
    } );
  }

  /**
   * Checks if the spell is in any of the actor's grimoires.
   * @param {ActorEd} actor - The actor to check for the spell.
   * @returns {boolean} - Returns true if the spell is in any of the actor's grimoires, false otherwise.
   */
  inActorGrimoires( actor ) {
    return !!actor.itemTypes.equipment.find( item => item.system.grimoire?.spells?.has( this.parent.uuid ) );
  }

  /**
   * Checks if the spell is learned by the given actor. This is defined as the spell being present in the actor's
   * items of type "spell".
   * @param {ActorEd} actor - The actor to check for the spell.
   * @returns {boolean} - Returns the spell item if it is learned by the actor, false otherwise.
   */
  learnedBy( actor ) {
    if ( !actor ) return undefined;

    return !!actor.itemTypes.spell.find( i => i.uuid === this.parent.uuid );
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