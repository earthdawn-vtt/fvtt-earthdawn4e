import KnockdownRollOptions from "../../data/roll/knockdown.mjs";
import ActorWorkflow from "./actor-workflow.mjs";
import Rollable from "./rollable.mjs";

/**
 * @typedef {object} KnockdownWorkflowOptions
 * @property {object} [knockdownAbility] - The ability used for the knockdown test (optional).
 * @property {number} [damageTaken] - The amount of damage taken (optional).
 */

export default class KnockdownWorkflow extends Rollable( ActorWorkflow ) {

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
   * @param {foundry.documents.Actor} actor - The actor that is performing the knockdown.
   * @param {KnockdownWorkflowOptions} [options] - The options for the knockdown workflow.
   */
  constructor( actor, options = {} ) {
    super( actor, options );
    this._damageTaken = options.damageTaken || 0;
    this._knockdownAbility = options.knockdownAbility || null;
    this._rollToMessage = true;

    this._steps.push(
      this.#validate.bind( this ),
      this.#chooseKnockdownAbility.bind( this ),
    );
    this._initRollableSteps();
  }

  async #validate() {
    if ( this._actor.statuses.has( "knockedDown" ) ) {
      ui.notifications.info(
        "ED.Notifications.Info.alreadyKnockedDown",
        { localize: true },
      );
      this.cancel();
    }
  }

  async #chooseKnockdownAbility() {
    if ( this._knockdownAbility ) return;

    const abilityUuid = await this._actor.getPrompt( "knockdown" );
    this._knockdownAbility = await fromUuid( abilityUuid ) ?? null;
  }

  /** @inheritDoc */
  async _prepareRollOptions() {
    this._rollOptions = KnockdownRollOptions.fromActor(
      {
        knockdownAbility: this._knockdownAbility,
        damageTaken:       this._damageTaken,
      },
      this._actor,
    );
  }
}