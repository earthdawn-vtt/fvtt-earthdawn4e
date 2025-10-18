import ActorWorkflow from "./actor-workflow.mjs";
import Rollable from "./rollable.mjs";
import EdRollOptions from "../../data/roll/common.mjs";
import ED4E from "../../config/_module.mjs";

/**
 * Workflow for handling actor attribute tests
 * @typedef {object} AttributeWorkflowOptions
 * @property {string} attributeId - The attribute ID to use for the attribute roll.
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
   * @param {ActorEd} actor The actor performing the attribute
   * @param {AttributeWorkflowOptions & RollableWorkflowOptions & WorkflowOptions} [options] Options for the attribute workflow
   */
  constructor( actor, options = {} ) {
    super( actor, options );

    this._attributeId = options.attributeId;

    this._rollToMessage = options.rollToMessage ?? true;
    this._rollPromptTitle = "TODO: Localize";

    this._initRollableSteps();
  }

  /** @inheritDoc */
  async _prepareRollOptions() {
    const stepModifiers = {};
    const allTestsModifiers = this._actor.system.globalBonuses?.allTests.value ?? 0;
    const allActionsModifiers = this._actor.system.globalBonuses?.allActions.value ?? 0;
    if ( allTestsModifiers ) {
      stepModifiers[ED4E.EFFECTS.globalBonuses.allTests.label] = allTestsModifiers;
    }
    if ( allActionsModifiers ) {
      stepModifiers[ED4E.EFFECTS.globalBonuses.allActions.label] = allActionsModifiers;
    }
    const attribute = this._actor.system.attributes[this._attributeId];
    this._rollOptions = EdRollOptions.fromActor(
      {
        step:         {
          base:      attribute.step,
          modifiers: stepModifiers
        },
        
        target:      {
          base:      undefined,
        },
        chatFlavor: game.i18n.format(
          "ED.Chat.Flavor.rollAttribute",
          {
            actor:     this._actor.name,
            step:      attribute.step,
            attribute: ED4E.attributes[this._attributeId].label,
          },
        ),
        rollType: "attribute",
        testType: "action",
      },
      this._actor,
    );
  }
}
