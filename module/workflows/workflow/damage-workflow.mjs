import Rollable from "./rollable.mjs";
import SentientTemplate from "../../data/actor/templates/sentient.mjs";
import DamageRollOptions from "../../data/roll/damage.mjs";
import ActorWorkflow from "./actor-workflow.mjs";
import { COMBAT } from "../../config/_module.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

/**
 * @typedef {WorkflowOptions} CombatDamageWorkflowOptions
 * @property {ItemEd} sourceDocument The document that is causing the damage. The following item types are valid:
 * <ul>
 *   <li>weapon</li>
 *   <li>power</li>
 *   <li>spell</li>
 *   <li>ability (with roll type "damage")</li>
 *   <li>actor (sentient, for unarmed attacks)</li>
 * </ul>
 * @property {EdRoll} [attackRoll] The attack roll that caused the damage. This is used to determine
 * the bonus to the damage step from extra successes.
 * @property {object} [damageRollOptions] Any additional options to pass to the damage roll. Must be one of the
 * {@link EdDamageRollOptionsInitializationData} or {@link DamageRollOptions} types.
 * @property {boolean} [promptForModifierAbilities=true] Whether to prompt the user to select abilities that substitute
 * or increase the damage step.
 */

/**
 * Workflow for rolling combat damage. This includes damage with weapons, spells, powers, abilities and unarmed
 * attacks.
 * @augments {ActorWorkflow}
 * @mixes {Rollable}
 */
export default class CombatDamageWorkflow extends Rollable( ActorWorkflow ) {

  // region Static Properties

  ALLOWED_SOURCE_DOCUMENT_TYPES = [
    ...SentientTemplate.SENTIENT_ACTOR_TYPES,
    SYSTEM_TYPES.Item.weapon,
    SYSTEM_TYPES.Item.power,
    SYSTEM_TYPES.Item.spell,
    SYSTEM_TYPES.Item.knackAbility,
    SYSTEM_TYPES.Item.devotion,
    SYSTEM_TYPES.Item.skill,
    SYSTEM_TYPES.Item.talent,
  ];

  // endregion

  // region Properties

  /**
   * The actor that is causing the damage.
   * @type {ActorEd|null}
   */
  _attacker;

  /**
   * The type of damage source (e.g., weapon, spell).
   * @type {string}
   */
  _damageSourceType;

  /**
   * The document that is causing the damage, e.g. a weapon, an attack power, or an actor.
   * @type {ActorEd|ItemEd}
   */
  _sourceDocument;

  /**
   * The attack roll that caused the damage. This is used to determine the bonus to the damage step from
   * extra successes.
   * @type {EdRoll|null}
   */
  _attackRoll;

  /**
   * Any additional options to pass to the damage roll. Must be one of the
   * {@link EdDamageRollOptionsInitializationData} or {@link DamageRollOptions} types.
   * @type {object|null}
   */
  _damageRollOptions;

  /**
   * Whether to prompt the user to select abilities that substitute or increase the damage step.
   * @type {boolean}
   */
  _promptForModifierAbilities;

  /**
   * Function mapping to prepare roll data based on the damage source type.
   * @type {{string: Function}}
   */
  _prepareRollOptionsFunction = {
    arbitrary: this._prepareArbitraryRollData.bind( this ),
    power:     this._preparePowerRollData.bind( this ),
    spell:     this._prepareSpellRollData.bind( this ),
    unarmed:   this._prepareUnarmedRoll.bind( this ),
    weapon:    this._prepareWeaponRollData.bind( this ),
  };

  /**
   * The ability that replaces the damage step, if any.
   * @type {ItemEd|null}
   */
  _replacementAbility = null;

  /**
   * Abilities that increase the damage step, if any.
   * @type {ItemEd[]}
   */
  _increaseAbilities = [];

  // endregion

  /**
   * @inheritDoc
   * @param {ActorEd} actor The actor that this workflow is associated with.
   * @param {CombatDamageWorkflowOptions&RollableWorkflowOptions} options The options for this workflow.
   */
  constructor( actor, options ) {
    super( actor, options );
    if ( !options.sourceDocument ) {
      throw new Error( "CombatDamageWorkflow requires a source document." );
    }
    if ( !this.ALLOWED_SOURCE_DOCUMENT_TYPES.includes( options.sourceDocument.type ) ) {
      throw new Error( `CombatDamageWorkflow sourceDocument type must be in ALLOWED_SOURCE_DOCUMENT_TYPES.
      Got ${ options.sourceDocument.type } instead.` );
    }

    this._damageSourceType = this._determineDamageSourceType( options );

    this._sourceDocument = options.sourceDocument;
    this._attackRoll = options.attackRoll || null;
    this._attacker = this._actor;
    this._damageRollOptions = options.damageRollOptions || null;
    this._promptForModifierAbilities = options.promptForModifierAbilities ?? true;

    this._rollPromptTitle = game.i18n.format(
      "ED.Dialogs.RollPrompt.Title.damage",
      {
        damageSourceType: COMBAT.damageSourceConfig[ this._damageSourceType ].label,
      },
    );

    this._rollToMessage = options.rollToMessage ?? true;
    this._initRollableSteps();
  }

  // region Steps

  /** @inheritdoc */
  async _prepareRollOptions() {
    await this._prepareModifierAbilities();
    const rollData = await this._prepareRollOptionsFunction[ this._damageSourceType ]();
    this._rollOptions = this._attacker
      ? DamageRollOptions.fromActor( rollData, this._attacker, )
      : DamageRollOptions.fromData( rollData, );
  }

  // endregion

  // region Methods

  /**
   * Determine the damage source type based on the source document.
   * @param {CombatDamageWorkflowOptions} options The options for this workflow.
   * @returns {keyof typeof damageSourceConfig} The determined damage source type.
   */
  _determineDamageSourceType( options ) {
    const documentType = options.sourceDocument.type;
    if ( SentientTemplate.SENTIENT_ACTOR_TYPES.includes( documentType ) ) return "unarmed";
    if ( [ SYSTEM_TYPES.Item.power, SYSTEM_TYPES.Item.spell, SYSTEM_TYPES.Item.weapon, ].includes( documentType ) ) return documentType;
    // rollable abilities
    return "arbitrary";
  }

  /**
   * Prepare roll data for arbitrary damage sources.
   * @returns {Promise<ArbitraryDamageInitializationData>} The prepared roll data.
   */
  async _prepareArbitraryRollData() {
    return {
      damageSourceType: this._damageSourceType,
      sourceDocument:   this._sourceDocument,
    };
  }

  /**
   * Prepare roll data for power damage sources.
   * @returns {Promise<PowerDamageInitializationData>} The prepared roll data.
   */
  async _preparePowerRollData() {
    return {
      damageSourceType: this._damageSourceType,
      sourceDocument:   this._sourceDocument,
    };
  }

  /**
   * Prepare roll data for spell damage sources.
   * @returns {Promise<SpellDamageInitializationData>} The prepared roll data.
   */
  async _prepareSpellRollData() {
    const willforce = this._damageRollOptions?.willforce
      ?? await this._sourceDocument.system.getWillforceForRoll( this._attacker );
    return {
      damageSourceType: this._damageSourceType,
      sourceDocument:   this._sourceDocument,
      caster:           this._attacker,
      willforce,
    };
  }

  /**
   * Prepare roll data for unarmed damage sources.
   * @returns {Promise<UnarmedDamageInitializationData>} The prepared roll data.
   */
  async _prepareUnarmedRoll() {
    const rollData = {
      damageSourceType:   this._damageSourceType,
      sourceDocument:     this._sourceDocument,
      attackRoll:         this._attackRoll,
    };
    if ( this._replacementAbility ) rollData.replacementAbility = this._replacementAbility;
    if ( this._increaseAbilities.length ) rollData.increaseAbilities = this._increaseAbilities;
    return rollData;
  }

  /**
   * Prepare roll data for weapon damage sources.
   * @returns {Promise<WeaponDamageInitializationData>} The prepared roll data.
   */
  async _prepareWeaponRollData() {
    const rollData = {
      damageSourceType: this._damageSourceType,
      sourceDocument:   this._sourceDocument,
      attackRoll:       this._attackRoll,
    };
    if ( this._replacementAbility ) rollData.replacementAbility = this._replacementAbility;
    if ( this._increaseAbilities.length ) rollData.increaseAbilities = this._increaseAbilities;
    return rollData;
  }

  /**
   * Prepare any modifier abilities that may affect the damage roll.
   * This includes abilities that replace the damage step or increase it.
   * If the damage roll options already specify these abilities, they are used directly.
   * Otherwise, if prompting is enabled and an attacker is present, the user is prompted to select abilities.
   * @returns {Promise<void>}
   */
  async _prepareModifierAbilities() {
    if ( this._damageRollOptions?.replacementAbility || this._damageRollOptions?.increaseAbilities ) {
      this._replacementAbility = this._damageRollOptions.replacementAbility ?? null;
      this._increaseAbilities = this._damageRollOptions.increaseAbilities ?? [];
      return;
    }
    if ( !this._promptForModifierAbilities || !this._attacker ) return;

    const damageModifierUuids = await this._attacker.getPrompt( "chooseDamageModifier" );
    if ( !damageModifierUuids ) return;

    const { replacementAbilityUuid, increaseAbilityUuids } = damageModifierUuids;
    if ( replacementAbilityUuid ) this._replacementAbility = await fromUuid( replacementAbilityUuid );
    if ( increaseAbilityUuids?.length ) this._increaseAbilities = await Promise.all(
      increaseAbilityUuids.map( async ( uuid ) => fromUuid( uuid ) ),
    );
  }

  // endregion
}