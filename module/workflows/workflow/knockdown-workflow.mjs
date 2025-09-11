import KnockdownRollOptions from "../../data/roll/knockdown.mjs";
import RollProcessor from "../../services/roll-processor.mjs";
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
   * Whether the target is immune to knockdown effects.
   * @type {boolean}
   */
  _immune;  

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
    this._immune = actor.system.knockdown.immune || false;
    this._damageTaken = options.damageTaken || 0;
    this._woundThreshold = actor.system.characteristics.health.woundThreshold;
    this._strain = options.knockdownAbility?.system?.strain || 0;
    this._knockdownStep = this._knockdownAbility ? this._knockdownAbility.system.rankFinal :actor.system.knockdown.step;
    // include option to set difficulty to full damage taken
    this._difficulty = options.difficulty || game.settings.get( "ed4e", "minimumDifficulty" );

    this._steps = [
      this._checkKnockdownStatus.bind( this ),
      this.getKnockdownAbility.bind( this ),
      this._prepareKnockdownRollOptions.bind( this ),
      this._performKnockdownRoll.bind( this ),
      this._processKnockdown.bind( this ),
      this._rollToChat.bind( this ),
    ];
  }

  async _checkKnockdownStatus() {
    if ( this._actor.statuses.has( "knockedDown" ) ) {
      ui.notifications.info( game.i18n.localize( "ED.Notifications.Info.alreadyKnockedDown" ) );
      this.cancel();
    }
  }

  async getKnockdownAbility() {
    this._knockdownAbility = await this._actor.knockdownAbility();
  }

  async _prepareKnockdownRollOptions() {
    const stepModifiers = {};
    const knockdownModifier = this._actor.system.globalBonuses?.allKnockdownTests.value ?? 0;
    if ( knockdownModifier ) {
      stepModifiers.knockdown = knockdownModifier;
    }
    this._rollOptions = KnockdownRollOptions.fromActor(
      {
        step:         {
          base:      this._knockdownStep,
          modifiers: stepModifiers
        },
        strain: {
          base:      this._strain,
        },
        target: {
          base:      this._difficulty,
        },
        // KnockdownAbilityUuid: to be done 
        chatFlavor: game.i18n.format ( 
          "ED.Chat.Flavor.knockdownTest",
          {
            actor: this._actor.name,
            step:  this._knockdownStep,
          }
        )
      },
      this._actor,
    );
  }

  /**
   * Performs the knockdown roll.
   * @returns {Promise<void>}
   * @private
   */
  async _performKnockdownRoll() {
    if ( this._roll === null ) {
      this._roll = null;
      this._result = null;
      return;
    }

    await this._createRoll();
    await this._roll.evaluate();
    this._result = this._roll;
  }

  /**
   * Processes the knockdown result.
   * @returns {Promise<void>}
   * @private
   */
  async _processKnockdown() {
    
    await RollProcessor.process( this._roll, this._actor, { rollToMessage: false, } );
    const isSuccess = this._result.total >= this._difficulty;
    if ( !isSuccess ) {
      // set status effect for knockdown etc.
      await this._actor.toggleStatusEffect( "knockedDown", { active: true, overlay: true, }, );
    } 
  }
}