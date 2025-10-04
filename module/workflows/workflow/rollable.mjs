/**
 * @typedef {object} RollableWorkflowOptions
 * @property {EdRoll} [roll] The roll to use for this workflow.
 * @property {EdRollOptions} [rollOptions] The options to use for creating rolls.
 * @property {boolean} [rollToMessage=false] Whether to send the roll result to the chat as a message.
 */

import RollPrompt from "../../applications/global/roll-prompt.mjs";
import RollProcessor from "../../services/roll-processor.mjs";
import EdRollOptions from "../../data/roll/common.mjs";

/**
 * @typedef {object} RollableWorkflowOptions
 * @property {EdRoll} [roll] The roll to use for this workflow.
 * @property {EdRollOptions} [rollOptions] The options to use for creating rolls.
 * @property {boolean} [rollToMessage=false] Whether to send the roll result to the chat as a message.
 */

/**
 * A mixin that adds roll-related functionality to a workflow.
 * This mixin can be applied to any workflow that needs to perform dice rolls.
 * @param {typeof Workflow} WorkflowClass The workflow class to mix into
 * @returns {typeof Workflow} A new class with the Rollable functionality mixed in
 * @mixin
 */
export default function Rollable( WorkflowClass ) {
  return class RollableWorkflow extends WorkflowClass {

    /**
     * The evaluated roll created for this workflow.
     * @type {EdRoll}
     */
    _result;

    /**
     * The roll object associated with this workflow.
     * @type {EdRoll}
     */
    _roll;

    /**
     * The options used to create the roll.
     * @type {EdRollOptions}
     */
    _rollOptions;

    /**
     * Whether the roll result should be sent to the chat as a message.
     * @type {boolean}
     */
    _rollToMessage;

    /**
     * The title for the roll prompt application.
     * @type {string}
     * @private
     */
    _rollPromptTitle;

    /**
     * @param {...any} args The constructor arguments
     */
    constructor( ...args ) {
      super( ...args );

      // Extract roll-related options if provided
      const options = args[args.length - 1] || {};
      if ( options.roll ) this._roll = options.roll;
      if ( options.rollOptions ) this._rollOptions = options.rollOptions;
      this._rollToMessage = options.rollToMessage ?? false;
    }

    /**
     * Initialize default steps for rollable workflows.
     *
     * Prepare roll options -> Create roll -> Evaluate result roll -> Process roll.
     */
    _initRollableSteps() {
      this._steps.push(
        this._prepareRollOptions.bind( this ),
        this._createRoll.bind( this ),
        this._evaluateResultRoll.bind( this ),
        this._processRoll.bind( this ),
      );

      if ( this._rollToMessage ) {
        this._steps.push( this._rollToChat.bind( this ) );
      }
    }

    /**
     * Prepare the roll options for this workflow.
     * This method should usually be overridden by subclasses to
     * set specific roll options.
     * @returns {Promise<void>}
     */
    async _prepareRollOptions() {
      this._rollOptions ??= new EdRollOptions();
    }

    /**
     * Create the roll for this workflow based on {@link _rollOptions}.
     * @returns {Promise<void>}
     * @private
     */
    async _createRoll() {
      if ( !this._rollOptions ) {
        throw new Error( "Roll options are required to create a roll." );
      }

      // Create the roll using the provided options
      const applicationOptions = {};
      if ( this._rollPromptTitle ) {
        applicationOptions.window = {
          title: this._rollPromptTitle
        };
      }

      this._roll = await RollPrompt.waitPrompt(
        this._rollOptions,
        {
          rollData: this._actor.getRollData(),
          options:  applicationOptions,
        }
      );
    }

    /**
     * Evaluate the result of the roll.
     * This method will resolve the roll and set the result of this workflow to the resolved roll.
     * @returns {Promise<void>}
     */
    async _evaluateResultRoll() {
      if ( !this._roll ) return;

      this._roll = await this._roll.evaluate();
      this._result = this._roll;
    }

    /**
     * Process the roll results.
     * This method can be overridden by subclasses to handle the roll results in a specific way.
     * By default, it uses the {@link RollProcessor} to process the roll.
     * @returns {Promise<void>}
     */
    async _processRoll() {
      if ( !this._roll ) return;

      // Process the roll results, this can be overridden by subclasses
      await RollProcessor.process(
        this._roll,
        this._actor,
        {
          rollToMessage: this._rollToMessage,
        }
      );
    }

    /**
     * Send the roll to the chat as a message.
     * @returns {Promise<void>}
     */
    async _rollToChat() {
      if ( !this._roll ) {
        return;
      }

      // Send the roll to chat
      await this._roll.toMessage( {
        flavor: this._rollOptions.chatFlavor || "",
      } );
    }

  };
}
