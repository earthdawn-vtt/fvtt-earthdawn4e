import ActorWorkflow from "./actor-workflow.mjs";
import Rollable from "./rollable.mjs";
import JumpUpRollOptions from "../../data/roll/jump-up.mjs";

/**
 * Workflow for handling actor jump up tests
 * @typedef {object} JumpUpWorkflowOptions
 * @property {ItemEd|null} [jumpUpAbility] The jump up ability used for the test
 */


export default class JumpUpWorkflow extends Rollable( ActorWorkflow ) {

  /**
   * The jump up ability used for the test
   * @type {ItemEd|null}
   */
  _jumpUpAbility = null;

  /**
   * @param {ActorEd} actor The actor performing the jump up
   * @param {JumpUpWorkflowOptions & RollableWorkflowOptions & WorkflowOptions} [options] Options for the jump up workflow
   */
  constructor( actor, options = {} ) {
    super( actor, options );

    this._jumpUpAbility = options.jumpUpAbility ?? null;

    this._rollToMessage = true;
    this._rollPromptTitle = game.i18n.localize(

    );

    this._steps.push(
      this.#validate.bind( this ),
      this.#chooseJumpUpAbility.bind( this ),
    );
    this._initRollableSteps();
  }

  async #validate() {
    if ( !this._actor.system.condition.knockedDown ) {
      ui.notifications.warn(
        "ED.Notifications.Warn.youAreNotKnockedDown",
        { localize: true }
      );
      this.cancel();
    }
  }

  async #chooseJumpUpAbility() {
    if ( this._jumpUpAbility ) return;

    const abilityUuid = await this._actor.getPrompt( "jumpUp" );
    this._jumpUpAbility = await fromUuid( abilityUuid ) ?? null;
  }

  /** @inheritDoc */
  async _prepareRollOptions() {
    this._rollOptions = JumpUpRollOptions.fromActor(
      {
        actor:         this._actor,
        jumpUpAbility: this._jumpUpAbility,
      },
      this._actor,
    );
  }

}