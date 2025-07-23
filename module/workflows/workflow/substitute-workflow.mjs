import ActorWorkflow from "./actor-workflow.mjs";
import Rollable from "./rollable.mjs";
import RollProcessor from "../../services/roll-processor.mjs";
import EdRollOptions from "../../data/roll/common.mjs";
import ED4E from "../../config/_module.mjs";

/**
 * Workflow for handling actor substituting an Ability with an Attribute
 */
export default class SubstituteWorkflow extends Rollable( ActorWorkflow ) {

  /**
   * attribute Id
   * @type {string}
   * @private
   */
  _attributeId;

  /**
   * substitute name
   * @type {string}
   * @private
   */
  _substituteName;

  /**
   * Actor
   * @type {ActorEd}
   * @private
   */
  _actor;

  /**
   * @param {ActorEd} actor The actor performing the attribute roll to substitute an Ability
   * @param {SubstituteWorkflowOptions} [options] Options for the substitute workflow
   */
  constructor( actor, options = {} ) {
    super( actor, options );
    this._actor = actor;
    this._attributeId = options.attributeId;
    this._substituteName = options.substituteName;

    this._steps = [
      this._prepareSubstituteRollOptions.bind( this ),
      this._performSubstituteRoll.bind( this ),
      this._processSubstituteRoll.bind( this ),
    ];
  }


  /**
   * Prepares the half magic roll options
   * @returns {Promise<void>}
   * @private
   */
  async _prepareSubstituteRollOptions() {
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
          "ED.Chat.Flavor.rollSubstitute",
          {
            actor:         this._actor.name,
            step:          attribute.step,
            attribute:     ED4E.attributes[this._attributeId].label,
            substitute:    this._substituteName,
          },
        ),
        rollType: "attribute",
        testType: "action",
      },
      this._actor,
    );
  }

  /**
   * Performs the half magic roll
   * @returns {Promise<void>}
   * @private
   */
  async _performSubstituteRoll() {
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
   * Processes the half magic based on the roll result and recovery mode
   * @returns {Promise<void>}
   * @private
   */
  async _processSubstituteRoll() {
    await RollProcessor.process( this._roll, this._actor, { rollToMessage: true, } );
  }

}
