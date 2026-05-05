import ActorWorkflow from "./actor-workflow.mjs";
import Rollable from "./rollable.mjs";
import AttributeRollOptions from "../../data/roll/attribute.mjs";
import * as ROLLS from "../../config/rolls.mjs";

/**
 * Workflow for handling actor attribute tests
 * @typedef {object} AttributeWorkflowOptions
 * @property {string} attributeId - The attribute ID to use for the attribute roll.
 * @property {difficulty} difficulty - The difficulty to use for the roll.
 */

/**
 * Workflow for handling actor attribute tests
 * @mixes Rollable
 */
export default class AttributeWorkflow extends Rollable( ActorWorkflow ) {

  /**
   * Attribute Id
   * @type {string}
   * @private
   */
  _attributeId;

  /**
   * Difficulty for the roll
   * @type {difficulty}
   */
  _difficulty;
   
  /**
   * @param {ActorEd} actor The actor performing the attribute
   * @param {AttributeWorkflowOptions & RollableWorkflowOptions & WorkflowOptions} [options] Options for the attribute workflow
   */
  constructor( actor, options = {} ) {
    super( actor, options );

    this._attributeId = options.attributeId;
    this._difficulty = options.difficulty ?? ROLLS.minDifficulty;

    this._rollToMessage = options.rollToMessage ?? true;
    this._rollPromptTitle = _loc( "ED.Dialogs.RollPrompt.Title.rollAttribute" );

    this._initRollableSteps();
  }

  /** @inheritDoc */
  async _prepareRollOptions() {
    this._rollOptions = AttributeRollOptions.fromActor(
      {
        attribute:   this._attributeId,
        target:      {
          base:      this._difficulty,
        },
      },
      this._actor,
    );
  }
}
