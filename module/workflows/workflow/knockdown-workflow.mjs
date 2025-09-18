import KnockdownRollOptions from "../../data/roll/knockdown.mjs";
import { ActorWorkflow } from "./_module.mjs";
import Rollable from "./rollable.mjs";

/**
 * @typedef {object} KnockdownWorkflowOptions
 * @property {object} [knockdownAbility] - The ability used for the knockdown test (optional).
 * @property {number} [difficulty] - The difficulty for the knockdown test (optional).
 */

export default class KnockdownWorkflow extends Rollable( ActorWorkflow ) {
  /**
   * The step used to withstand the knockdown.
   * @type {number}
   */
  _knockdownStep;

  /**
   * The wound threshold of the Actor.
   * @type {number}
   */
  _woundThreshold;

  /**
   * Knockdown test difficulty.
   * @type {number}
   */
  _difficulty;

  /**
   * Damage taken.
   * @type {number}
   */
  _damageTaken;

  /**
   * Knockdown Ability.
   * @type {object|null}
   */
  _knockdownAbility;

  /**
   * Knockdown strain.
   * @type {number}
   */
  _strain;

  /**
   * @param {foundry.documents.Actor} actor - The actor that is performing the knockdown.
   * @param {KnockdownWorkflowOptions} [options] - The options for the knockdown workflow.
   */
  constructor( actor, options = {} ) {
    super( actor, options );
    this._damageTaken = options.damageTaken || 0;
    this._woundThreshold = actor.system.characteristics.health.woundThreshold;
    this._strain = options.knockdownAbility?.system?.strain || 0;
    this._knockdownStep = this._knockdownAbility ? this._knockdownAbility.system.rankFinal : actor.system.knockdownStep;
    // include option to set difficulty to full damage taken
    this._difficulty = options.difficulty || game.settings.get( "ed4e", "minimumDifficulty" );

    this._steps = [
      this._checkKnockdownStatus.bind( this ),
      this.getKnockdownAbility.bind( this ),
      this._prepareKnockdownRollOptions.bind( this ),
      this._createRoll.bind( this ),
      this._evaluateResultRoll.bind( this ),
      this._processRoll.bind( this ),
      this._rollToChat.bind( this ),
    ];
  }

  /**
   * Check if the actor is already knocked down.
   * @returns {Promise<void>}
   * @private
   */
  async _checkKnockdownStatus() {
    if ( this._actor.statuses.has( "knockedDown" ) ) {
      ui.notifications.info( game.i18n.localize( "ED.Notifications.Info.alreadyKnockedDown" ) );
      this.cancel();
    }
  }

  /**
   * Fetch the knockdown ability item for the actor.
   * @returns {Promise<void>}
   * @private
   */
  async getKnockdownAbility() {
    this._knockdownAbility = await this._actor.knockdownAbility();
  }

  /**
   * Prepare the roll options for the knockdown test.
   * @returns {Promise<void>}
   * @private
   */
  async _prepareKnockdownRollOptions() {
    const stepModifiers = {};
    const knockdownModifier = this._actor.system.globalBonuses?.allKnockdownTests.value ?? 0;
    if ( knockdownModifier ) {
      stepModifiers.knockdown = knockdownModifier;
    }
    this._rollOptions = KnockdownRollOptions.fromActor(
      {
        knockdownAbility: this._knockdownAbility,
        damageTaken:       this._damageTaken,
      },
      this._actor,
    );
  }
}