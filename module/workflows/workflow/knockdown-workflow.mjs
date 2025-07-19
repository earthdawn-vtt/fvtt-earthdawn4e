import KnockdownRollOptions from "../../data/roll/knockdown.mjs";
import RollProcessor from "../../services/roll-processor.mjs";
import { ActorWorkflow } from "./_module.mjs";
import Rollable from "./rollable.mjs";

/**
 * @typedef {object} KnockdownWorkflowOptions
 * @property {number} knockdownStep - The step at which the knockdown occurs.
 * @property {boolean} immune - Whether the target is immune to knockdown effects.
 */
export default class KnockdownWorkflow extends Rollable( ActorWorkflow ) {
  /**
   * The step used to withstand the knockdown.
   * @type {number}
   */
  _knockdownStep;

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
   * @param {foundry.documents.Actor} actor - The actor that is performing the knockdown.
   * @param {KnockdownWorkflowOptions} options - The options for the knockdown workflow.
   */
  constructor( actor, options ) {
    super( actor, options );
    this._knockdownStep = actor.system.knockdown.step;
    this._immune = actor.system.knockdown.immune || false;
    // include option to set difficulty to full damage taken
    this._difficulty = options.difficulty || game.settings.get( "ed4e", "minimumDifficulty" );

    this._steps = [
      this._prepareKnockdownRollOptions.bind( this ),
      this._performKnockdownRoll.bind( this ),
      this._processKnockdown.bind( this ),
      this._rollToChat.bind( this ),
    ];
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
      ui.notifications.warn( "YOU ARE DOWN!" );
      // set status effect for knockdown etc.
      return;
    }

  }

}