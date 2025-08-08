import ActorWorkflow from "./actor-workflow.mjs";
import Rollable from "./rollable.mjs";
import EdRollOptions from "../../data/roll/common.mjs";
import ED4E from "../../config/_module.mjs";
import PromptFactory from "../../applications/global/prompt-factory.mjs";

/**
 * Workflow for handling actor half magic tests
 * @typedef {object} HalfMagicWorkflowOptions
 * @property {string} attributeId - The attribute ID to use for the half magic roll.
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
   * @param {HalfMagicWorkflowOptions} [options] Options for the half magic workflow
   */
  constructor( actor, options = {} ) {
    super( actor, options );
    this._attributeId = options.attributeId;
    this._rollToMessage = true;

    this._steps = [
      this._prepareHalfMagicRollOptions.bind( this ),
      this._createRoll.bind( this ),
      this._evaluateResultRoll.bind( this ),
      this._processRoll.bind( this ),
    ];
  }

  /**
   * Prepares the half magic roll options
   * @returns {Promise<void>}
   * @private
   */
  async _prepareHalfMagicRollOptions() {
    let discipline;
    if ( this._actor.isMultiDiscipline ) {
      const promptFactory = PromptFactory.fromDocument( this._actor );
      const disciplineUuid = await promptFactory.getPrompt( "halfMagicDiscipline" );
      discipline = await fromUuid( disciplineUuid );
    } else {
      discipline = this._actor.highestDiscipline;
    }
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
            attribute:  ED4E.attributes[this._attributeId].label,
          },
        ),
        rollType: "attribute",
        testType: "action",
      },
      this._actor,
    );
  }
}
