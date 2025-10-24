import ItemDescriptionTemplate from "./templates/item-description.mjs";
import LearnableTemplate from "./templates/learnable.mjs";
import ED4E, { ACTORS, COMBAT, MAGIC } from "../../config/_module.mjs";
import LearnSpellPrompt from "../../applications/advancement/learn-spell.mjs";
import TargetTemplate from "./templates/targeting.mjs";
import { AreaMetricData, DurationMetricData, MetricData, RangeMetricData } from "../common/metrics.mjs";
import ItemDataModel from "../abstract/item-data-model.mjs";
import { SelectExtraThreadsPrompt } from "../../applications/workflow/_module.mjs";
import ThreadWeavingRollOptions from "../roll/weaving.mjs";
import { RollPrompt } from "../../applications/global/_module.mjs";
import SpellcastingRollOptions from "../roll/spellcasting.mjs";
import RollProcessor from "../../services/roll-processor.mjs";
import SpellEffectRollOptions from "../roll/spelleffect.mjs";
import CombatDamageWorkflow from "../../workflows/workflow/damage-workflow.mjs";


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

  // endregion

  // region Static Methods

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
      effect: new fields.SchemaField( {
        type: new fields.StringField( {
          required: true,
          blank:    false,
          choices:  MAGIC.spellEffectTypes,
          initial:  "special",
        } ),
        details: new fields.SchemaField( {
          damage:  new fields.SchemaField( {
            attribute:    new fields.StringField( {
              required: true,
              nullable: false,
              blank:    true,
              choices:  ACTORS.attributes,
              initial:  "wil",
            } ),
            stepModifier: new fields.NumberField( {
              required: true,
              nullable: false,
              initial:  0,
              integer:  true,
            } ),
            addCircle: new fields.BooleanField( {
              required: true,
              nullable: false,
              initial:  false,
            } ),
            damageType: new fields.StringField( {
              required: true,
              nullable: false,
              blank:    false,
              choices:  COMBAT.damageType,
              initial:  "standard",
            }, ),
            armorType: new fields.StringField( {
              required: true,
              nullable: true,
              blank:    true,
              initial:  "",
              choices:  ACTORS.armor,
            }, ),
          }, {} ),
          effect:  new fields.SchemaField( {
            attribute:    new fields.StringField( {
              required: true,
              nullable: false,
              blank:    true,
              choices:  ACTORS.attributes,
              initial:  "wil",
            } ),
            stepModifier: new fields.NumberField( {
              required: true,
              nullable: false,
              initial:  0,
              integer:  true,
            } ),
            addCircle: new fields.BooleanField( {
              required: true,
              nullable: false,
              initial:  false,
            } ),
          }, {} ),
          macro:   new fields.SchemaField( {
            macroUuid: new fields.DocumentUUIDField( {
              type:     "Macro",
            }, ),
          }, {} ),
          special: new fields.SchemaField( {
            description: new fields.StringField( {
              required: true,
              nullable: false,
              blank:    true,
              trim:     true,
              initial:  "",
            }, ),
          }, {} ),
        }, {} ),
      }, {} ),
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
      extraSuccess: new fields.TypedSchemaField(
        MetricData.TYPES,
        {
          required: true,
          nullable: true,
        },
      ),
      extraThreads: new fields.TypedObjectField(
        new fields.TypedSchemaField( MetricData.TYPES, {
        } ),
        {
          required: true,
          nullable: true,
          initial:  null,
        }
      ),
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

  // region Getters

  /**
   * The extra success enhancement metric data, if any.
   * @type {MetricData|undefined}
   */
  get extraSuccessEnhancement() {
    return this.extraSuccess?.[ 0 ];
  }

  // endregion

  // region Checkers

  /**
   * Checks if the spell is in any of the actor's grimoires.
   * @param {ActorEd} [actor] - The actor to check for grimoires. If not provided, uses the containing actor of this spell.
   * @returns {boolean} - Returns true if the spell is in any of the actor's grimoires, false otherwise.
   */
  inActorGrimoires( actor ) {
    const owner = actor || this.containingActor;
    return this.actorGrimoires( owner )?.length > 0;
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

  // region Data Preparation

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();

    if ( this.effect?.type === "effect" ) {
      this.effect.details.effect.totalStep = this.getEffectStepTotal();
    }
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
          "ED.Actor.LpTracking.Spendings.learnSpell", {
            name: item.name,
          }
        ),
        entityType:  learnedItem.type,
        name:        learnedItem.name,
        itemUuid:    learnedItem.uuid,
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

  /**
   * Cast this spell using the given spellcasting ability.
   * @param {ItemEd} spellcastingAbility The ability used for casting this spell.
   * @param {object} [options] Additional options for the casting process.
   * @param {ActorEd} [options.caster] The actor casting the spell, if different from the containing actor.
   * @param {ItemEd} [options.grimoire] The grimoire this spell is cast from, if any.
   * @returns {Promise<EdRoll|undefined>} Returns the roll made for casting the spell, or undefined if no roll was made.
   */
  async cast( spellcastingAbility, options = {} ) {
    if ( !this.isWeavingComplete ) {
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.spellNotReadyToCast" ) );
      return;
    }

    const caster = options.caster || this.containingActor;
    const grimoire = options.grimoire;

    const spellcastingRollOptions = SpellcastingRollOptions.fromActor(
      {
        spellUuid:               this.parent.uuid,
        spell:                   this.parent,
        spellcastingAbilityUuid: spellcastingAbility.uuid,
        spellcastingAbility:     spellcastingAbility,
        grimoire,
      },
      caster,
    );

    const roll = await RollPrompt.waitPrompt(
      spellcastingRollOptions,
      {
        rollData: caster.getRollData(),
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
   * @param {object} [options] Additional options for the weaving process.
   * @param {ActorEd} [options.caster] The actor casting the spell, if different from the containing actor.
   * @param {ItemEd} [options.matrix] The matrix this spell is attuned to, if any.
   * @param {ItemEd} [options.grimoire] The grimoire this spell is attuned to, if any.
   * @returns {Promise<EdRoll|undefined>} Returns the roll made for weaving threads, or undefined if no roll was made.
   */
  async weaveThreads( threadWeavingAbility, options = {} ) {
    let system = this;
    const { grimoire, matrix } = options;
    const caster = options.caster || this.containingActor;

    if ( matrix && !matrix?.system?.canWeave() ) {
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.matrixBrokenCannotWeave" ) );
      return;
    }

    if ( !this.isWeaving ) {
      const chosenExtraThreads = await SelectExtraThreadsPrompt.waitPrompt( {
        spell:  this.parent,
        caster,
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
      const weavingRollOptions = ThreadWeavingRollOptions.fromActor(
        {
          spellUuid:          system.parent.uuid,
          spell:              system.parent,
          weavingAbilityUuid: threadWeavingAbility.uuid,
          weavingAbility:     threadWeavingAbility,
          grimoire,
          threads:            {
            required: system.threads.required,
            extra:    system.numChosenExtraThreads,
          },
        },
        caster,
      );

      const roll = await RollPrompt.waitPrompt(
        weavingRollOptions,
        {
          rollData: caster.getRollData(),
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
    } else {
      ui.notifications.info( game.i18n.localize( "ED.Notifications.Info.noWeavingNecessary" ) );
    }
  }

  // endregion

  // region Spell Effects

  /**
   * Roll damage for this spell's effect, if any.
   * @returns {Promise<EdRoll|undefined>} The processed damage roll, or undefined if no roll was made.
   * @throws {Error} If there is no caster available.
   */
  async rollDamage() {
    if ( this.effect?.type !== "damage" ) return;

    const caster = this.containingActor;
    if ( !caster ) throw new Error( "Cannot roll damage without a caster." );

    const damageWorkflow = new CombatDamageWorkflow(
      caster,
      {
        sourceDocument:             this.parent,
        promptForModifierAbilities: false,
      }
    );

    return /** @type {EdRoll} */ damageWorkflow.execute();
  }

  /**
   * Roll the effect test for this spell's effect, if any.
   * @returns {Promise<EdRoll|undefined>} The processed effect roll, or undefined if no roll was made.
   * @throws {Error} If there is no caster available.
   */
  async rollEffect() {
    if ( this.effect?.type !== "effect" ) return;

    const caster = this.containingActor;
    if ( !caster ) throw new Error( "Cannot roll effect without a caster." );

    const willpower = await this.getWillpowerForRoll( caster );
    if ( willpower === null ) return;

    const rollOptions = SpellEffectRollOptions.fromActor(
      {
        spell:           this.parent,
        willpower,
      },
      caster,
      {
        rollData: caster.getRollData(),
      }
    );
    const roll = await RollPrompt.waitPrompt( rollOptions );
    return RollProcessor.process( roll, caster, { rollToMessage: true, } );
  }

  /**
   * Run the macro associated with this spell's effect, if any.
   * @param {object} [scope] The scope to pass to the macro when executing it. Can be expanded
   * on the `scope` parameter in {@link Macro#execute}.
   * @returns {Promise<*>} See {@link Macro#execute} for details.
   */
  async runMacro( scope = {} ) {
    if ( this.effect?.type !== "macro" || !this.effect?.details?.macro?.macroUuid ) return;

    const macro = /** @type {Macro} */ await fromUuid( this.effect.details.macro.macroUuid );
    if ( !macro ) {
      throw new Error( "Spell macro not found" );
    }

    // Execute the macro with the provided options
    return await macro.execute( scope );
  }

  /**
   * Helper to get willpower for effect/damage rolls.
   * @param {ActorEd} [actor] The actor to get willpower for. If not provided, uses the containing actor of this spell.
   * @returns {Promise<ItemEd|undefined|null>} The willpower item if used, undefined if not used,
   * or null if the prompt was closed.
   * @throws {Error} If there is no caster available.
   */
  async getWillpowerForRoll( actor ) {
    const caster = actor || this.containingActor;
    if ( !caster ) throw new Error( "Cannot get willpower without a caster." );

    let willpower;
    if ( this.effect.details[ this.effect.type ].attribute === "wil" ) {
      willpower = await caster.getPrompt( "useWillpower" );
      if ( willpower === false ) willpower = undefined;
    }
    return willpower;
  }

  // endregion

  // region Methods

  /**
   * Returns all grimoires of the given actor that contain this spell.
   * @param {ActorEd} [actor] - The actor to check for grimoires. If not provided, uses the containing actor of this spell.
   * @returns {ItemEd[]} - Returns an array of grimoires that contain this spell.
   */
  actorGrimoires( actor ) {
    const owner = actor || this.containingActor;
    return owner.itemTypes.equipment.filter( item => item.system.grimoire?.spells?.has( this.parent.uuid ) );
  }

  /**
   * Adds an enhancement to this spell.
   * @param {keyof MetricData.TYPES} enhancementType The type of enhancement to add.
   * @param {"extraSuccess"|"extraThreads"} fieldName - The field to add the enhancement to.
   * @returns {Promise<ItemEd|undefined>} - Returns the updated spell item or undefined if not updated.
   */
  async addEnhancement( enhancementType, fieldName ) {
    if ( ![ "extraSuccess", "extraThreads" ].includes( fieldName ) )
      throw new Error( "Invalid field name for enhancement. Must be 'extraSuccess' or 'extraThreads'." );

    const enhancementData = MetricData.fromType( enhancementType );
    const isExtraSuccess = fieldName === "extraSuccess";

    const fieldPath = isExtraSuccess
      ? `system.==${ fieldName }`
      : `system.${ fieldName }.==${ enhancementType }`;

    return await this.parent.update( {
      [ fieldPath ]: enhancementData,
    } );
  }

  /**
   * Returns the attuned matrix for this spell, if it exists.
   * @returns {ItemEd|undefined} - Returns the attuned matrix item or undefined if not found.
   */
  getAttunedMatrix() {
    return this.containingActor?.items.find( item => {
      return item.system.matrix?.spells.has( this.parent.uuid );
    } );
  }

  /**
   * Returns all grimoires that are attuned to this spell for the given actor.
   * @param {ActorEd} [actor] - The actor to check for attuned grimoires. If not provided, uses the containing actor of this spell.
   * @returns {ItemEd[]} - Returns an array of grimoires that are attuned to this spell.
   */
  getAttunedGrimoires( actor ) {
    const owner = actor || this.containingActor;
    return this.actorGrimoires( owner ).filter(
      grimoire => grimoire.system.isSpellAttuned?.( this.parent.uuid )
    );
  }

  /**
   * Calculates the total effect step for this spell's effect, based on the
   * effect details and the caster's attributes.
   * @param {ActorEd} [actor] - The actor to use for the calculation. If not provided,
   * uses the containing actor of this spell.
   * @returns {number} - The total effect step.
   * @throws {Error} - Throws an error if effect details or caster are not available.
   */
  getEffectStepTotal( actor ) {
    const effectDetails = this.effect?.details.effect;
    const caster = actor || this.containingActor;
    if ( !effectDetails || !caster ) throw new Error( "Cannot calculate total effect step without effect details or caster." );

    return caster.system.attributes[ effectDetails.attribute ]?.step
      + ( effectDetails.stepModifier )
      + ( effectDetails.addCircle
        ? caster.getDisciplineForSpellcastingType( this.spellcastingType )?.system.level
        : 0 );
  }

  /**
   * Prepares the roll step data for this spell's effect, if it is of type "damage" or "effect".
   * This includes the base step and any applicable modifiers.
   * @param {object} options Options for the calculation.
   * @param {ActorEd} [options.actor] The actor to use for the calculation. If not provided,
   * uses the containing actor of this spell.
   * @param {ItemEd} [options.willpower] The willpower item to consider for the roll, if any.
   * This is only applied if the effect attribute is "wil".
   * @returns {RollStepData} The prepared roll step data.
   * @throws {Error} If the effect type is not "damage" or "effect", or if effect details or caster are not available.
   */
  getEffectDetailsRollStepData( options = {} ) {
    if ( ![ "damage", "effect" ].includes( this.effect?.type ) ) throw new Error( "Effect roll step data can only be prepared for effects of type 'damage' or 'effect'." );

    const { actor, willpower } = options;
    const effectDetails = this.effect?.details[ this.effect.type ];
    const caster = actor || this.containingActor;
    if ( !effectDetails || !caster ) throw new Error( "Cannot calculate total effect step without effect details or caster." );

    const attribute = effectDetails.attribute;
    const attributeStep = caster.system.attributes[ attribute ]?.step;
    const stepModifier = this.effect.details[ this.effect.type ].stepModifier;
    const circle = effectDetails.addCircle
      ? caster.getDisciplineForSpellcastingType( this.spellcastingType )?.system.level
      : undefined;

    const modifiers = {};
    const stepModifierLabel = game.i18n.localize(
      `ED.Data.Item.Spell.FIELDS.effect.details.${ this.effect.type }.stepModifier.label`
    );
    const disciplineName = MAGIC.spellcastingTypes[ this.spellcastingType ];
    const circleLabel = game.i18n.format(
      "ED.Rolls.Modifiers.spellEffectOrDamageStepCircle",
      { discipline: disciplineName }
    );

    if ( Number.isNumeric( attributeStep ) ) {
      if ( stepModifier ) modifiers[ stepModifierLabel ] = stepModifier;
      if ( effectDetails.addCircle ) modifiers[ circleLabel ] = circle;
      if ( willpower && attribute === "wil" ) modifiers[ willpower.name ] = willpower.system.level;
      return {
        base:      attributeStep,
        modifiers,
      };
    } else if ( effectDetails.addCircle ) {
      if ( stepModifier ) modifiers[ stepModifierLabel ] = stepModifier;
      return {
        base:      circle,
        modifiers,
      };
    } else {
      return {
        base:      stepModifier,
        modifiers,
      };
    }
  }

  // endregion

  // region Macros

  /** @inheritDoc */
  getDefaultMacroCommand( options = {} ) {
    return `const spell = await fromUuid("${this.parent.uuid}");\nawait spell.system.containingActor.castSpell( spell );`;
  }

  // endregion

}