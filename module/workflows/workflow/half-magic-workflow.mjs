import ActorWorkflow from "./actor-workflow.mjs";
import Rollable from "./rollable.mjs";
import EdRollOptions from "../../data/roll/common.mjs";
import PromptFactory from "../../applications/global/prompt-factory.mjs";
import * as ACTORS from "../../config/actors.mjs";
import * as EFFECTS from "../../config/effects.mjs";

/**
 * Workflow for handling actor half magic tests
 * @typedef {object} HalfMagicWorkflowOptions
 * @property {string} attributeId - The attribute ID to use for the half magic roll.
 */

/**
 * Workflow for handling actor half magic tests
 * @mixes Rollable
 */
export default class HalfMagicWorkflow extends Rollable( ActorWorkflow ) {

  /**
   * Attribute Id
   * @type {string}
   * @private
   */
  _attributeId;

  /**
   * @param {ActorEd} actor The actor performing the half magic
   * @param {HalfMagicWorkflowOptions & WorkflowOptions & RollableWorkflowOptions} [options] Options for the half magic workflow
   */
  constructor( actor, options = {} ) {
    super( actor, options );
    this._attributeId = options.attributeId;

    this._rollToMessage = options.rollToMessage ?? true;

    this._initRollableSteps();
  }

  /** @inheritDoc */
  async _prepareRollOptions() {
    let discipline;
    if ( this._actor.isMultiDiscipline ) {
      const promptFactory = PromptFactory.fromDocument( this._actor );
      const disciplineUuid = await promptFactory.getPrompt( "halfMagicDiscipline" );
      discipline = await fromUuid( disciplineUuid );
    } else {
      discipline = this._actor.highestDiscipline;
    }
    const stepModifiers = {};
    const allTestsModifiers = this._actor.system.globalModifiers?.allTests.value ?? 0;
    const allActionsModifiers = this._actor.system.globalModifiers?.allActions.value ?? 0;
    if ( allTestsModifiers ) {
      stepModifiers[EFFECTS.globalModifiers.allTests.label] = allTestsModifiers;
    }
    if ( allActionsModifiers ) {
      stepModifiers[EFFECTS.globalModifiers.allActions.label] = allActionsModifiers;
    }
    const attribute = this._actor.system.attributes[this._attributeId];
    const finalStep = attribute.step + discipline.system.level;
    this._rollOptions = EdRollOptions.fromActor(
      {
        step:         {
          base:      finalStep,
          modifiers: stepModifiers
        },
        
        target:      {
          base:      undefined,
        },
        chatFlavor: game.i18n.format(
          "ED.Chat.Flavor.rollHalfMagic",
          {
            actor:      this._actor.name,
            step:       finalStep,
            discipline: discipline.name,
            attribute:  ACTORS.attributes[this._attributeId].label,
          },
        ),
        rollType: "attribute",
        testType: "action",
      },
      this._actor,
    );
  }
}
