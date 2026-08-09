import ActorWorkflow from "./actor-workflow.mjs";
import Rollable from "./rollable.mjs";
import HalfMagicRollOptions from "../../data/roll/half-magic.mjs";
import * as ACTORS from "../../config/actors.mjs";
import * as ROLLS from "../../config/rolls.mjs";


/**
 * Workflow for handling actor half-magic tests
 * @typedef {object} HalfMagicWorkflowOptions
 * @property {string} attributeId - The ID of the attribute to use for the half-magic roll.
 * See {@link ACTORS#attributes}.
 * @property {ItemEd} [discipline] - The discipline to use for the half-magic roll.
 * @property {number} [difficulty] - The difficulty for the half-magic test.
 */

/**
 * Workflow for handling actor half magic tests
 * @mixes Rollable
 */
export default class HalfMagicWorkflow extends Rollable( ActorWorkflow ) {

  /**
   * Attribute ID
   * @type {string}
   */
  _attributeId;

  /**
   * The difficulty for the half-magic test
   * @type {number}
   */
  _difficulty;

  /**
   * The discipline used for the half-magic roll
   * @type {ItemEd|null}
   */
  _discipline;

  /**
   * @param {ActorEd} actor The actor performing the half magic
   * @param {HalfMagicWorkflowOptions & WorkflowOptions & RollableWorkflowOptions} [options] Options for the half magic workflow
   */
  constructor( actor, options = {} ) {
    super( actor, options );
    this._attributeId = options.attributeId;
    this._difficulty = options.difficulty ?? ROLLS.minDifficulty;
    this._discipline = options.discipline ?? null;

    this._rollToMessage = options.rollToMessage ?? true;
    this._rollPromptTitle = _loc(
      "ED.Dialogs.RollPrompt.Title.halfMagic",
      {
        attribute: ACTORS.attributes[this._attributeId].label,
      }
    );

    this._steps.push(
      this.#chooseDiscipline.bind( this ),
    );
    this._initRollableSteps();
  }

  /**
   * Prompt the user to choose a discipline for the half-magic roll.
   * @private
   */
  async #chooseDiscipline() {
    if ( this._discipline ) return;

    if ( !this._actor.isMultiDiscipline ) {
      this._discipline = this._actor.highestDiscipline;
      return;
    }

    const disciplineUuid = await this._actor.getPrompt( "halfMagicDiscipline" );
    this._discipline = await fromUuid( disciplineUuid );
  }

  /** @inheritDoc */
  async _prepareRollOptions() {
    this._rollOptions = HalfMagicRollOptions.fromActor(
      {
        attribute:  this._attributeId,
        discipline: this._discipline,
        target:     {
          base: this._difficulty,
        },
      },
      this._actor,
    );
  }

}
