import Rollable from "./rollable.mjs";
import ActorWorkflow from "./actor-workflow.mjs";
import { getDefaultEdid } from "../../settings.mjs";
import DialogEd from "../../applications/api/dialog.mjs";
import AbilityRollOptions from "../../data/roll/ability.mjs";

/**
 * @typedef {object} ItemHistoryWorkflowOptions
 * @property {ItemEd} [itemHistoryAbility] - The ability item used for the item history roll. If omitted, will be
 * searched from the rolling actor's abilities.
 * @property {Document} target - The target document for the item history roll. Must have a `truePattern` property
 * in its `system` data, as defined in {@link TruePatternData}.
 */

export default class ItemHistoryWorkflow extends Rollable( ActorWorkflow ) {

  static MAX_POSSIBLE_TYPES = {
    THREAD_ITEM_LEVEL:     "ED.Chat.Flavor.ItemHistoryMaxPossibleTypes.threadItemLevel",
    MAX_RANK:              "ED.Chat.Flavor.ItemHistoryMaxPossibleTypes.maxRank",
    NUMBER_UNKNOWN_LEVELS: "ED.Chat.Flavor.ItemHistoryMaxPossibleTypes.numberOfUnknownLevels",
  };

  /**
   * The ability used for the item history roll
   * @type {ItemEd|null}
   */
  _itemHistoryAbility;

  /**
   * The target document for the item history roll
   * @type {Document}
   */
  _target;

  /**
   * The maximum number of knowledge obtainable from the roll. Equals to the target's item history rank.
   * @type {number|null}
   */
  _maxObtainableKnowledge;

  /**
   * The number of thread item levels already known to the player.
   * @type {number}
   */
  _numAlreadyKnownLevels = 0;

  /**
   * The number of thread item levels in the target's true pattern, or undefined if the target has no levels.
   * @type {number|undefined}
   */
  _numThreadItemLevels;

  /**
   * The number of knowledge obtained from the roll.
   * @type {number}
   */
  _numObtainedKnowledge = 0;

  /**
   * The type of the maximum possible knowledge obtainable from the roll (e.g. "thread item level", or "max rank").
   * @type {string}
   * @private
   */
  _typeMaxPossible = "";

  /**
   * @inheritDoc
   * @param {ActorEd} rollingActor - The actor performing the item history roll
   * @param {WorkflowOptions & ItemHistoryWorkflowOptions} options - Options for the workflow
   */
  constructor( rollingActor, options = {} ) {
    super( rollingActor, options );

    this._itemHistoryAbility = options.itemHistoryAbility ?? null;
    this._target = options.target;
    if ( !this._target ) throw new Error( "Target document must be provided for ItemHistoryWorkflow." );
    if ( !this._target.system.truePattern ) throw new Error( "Target document must have a true pattern for ItemHistoryWorkflow." );

    this._numThreadItemLevels = this._target.system.truePattern.numberOfLevels;
    this._numAlreadyKnownLevels = this._target.system.truePattern.numberOfKnownLevels;

    this._rollToMessage = true;
    this._rollPromptTitle = game.i18n.localize( "ED.Dialogs.RollPrompt.Title.itemHistory" );

    this._steps.push(
      this.#initialize.bind( this ),
      this.#validate.bind( this ),
    );
    this._initRollableSteps();
    this._steps.push(
      this._confirmRoll.bind( this ),
      this.#revealKeyKnowledge.bind( this ),
    );
  }

  async #initialize() {
    await this.#initializeItemHistoryAbility();
    await this.#initializeKeyKnowledge();
  }

  async #initializeItemHistoryAbility() {
    if ( this._itemHistoryAbility )  return;

    this._itemHistoryAbility = this._actor.getSingleItemByEdid(
      getDefaultEdid( "itemHistory" ),
    );
    if ( !this._itemHistoryAbility ) {
      const continueWorkflow = await DialogEd.confirm( {
        content: game.i18n.localize( "ED.Dialogs.Title.missingItemHistoryAbilityConfirm" ),
        window:  {
          title:   game.i18n.localize( "ED.Dialogs.missingItemHistoryAbilityConfirm" ),
        },
      } );
      if ( continueWorkflow !== true ) this.cancel();
    }
  }

  async #initializeKeyKnowledge() {
    this.#determineMaxObtainableKnowledge();
  }

  #determineMaxObtainableKnowledge() {
    this._maxObtainableKnowledge = this._itemHistoryAbility.system.level;
    this._typeMaxPossible = ItemHistoryWorkflow.MAX_POSSIBLE_TYPES.MAX_RANK;

    if ( this._numThreadItemLevels !== undefined ) {
      const numUnknownLevels = this._target.system.truePattern.numberOfUnknownLevels;
      if ( numUnknownLevels < this._maxObtainableKnowledge ) {
        this._maxObtainableKnowledge = numUnknownLevels;
        this._typeMaxPossible = ItemHistoryWorkflow.MAX_POSSIBLE_TYPES.NUMBER_UNKNOWN_LEVELS;
      }
    }

    if ( this._numThreadItemLevels !== undefined ) {
      if ( this._numThreadItemLevels < this._maxObtainableKnowledge ) {
        this._maxObtainableKnowledge = this._numThreadItemLevels;
        this._typeMaxPossible = ItemHistoryWorkflow.MAX_POSSIBLE_TYPES.THREAD_ITEM_LEVEL;
      }
    }
  }

  async #validate() {}

  /** @inheritDoc */
  async _prepareRollOptions() {
    this._rollOptions = AbilityRollOptions.fromActor(
      {
        ability:    this._itemHistoryAbility,
        target:     {
          base: this._target.system.truePattern.mysticalDefense,
        },
      },
      this._actor,
    );
  }

  /** @inheritDoc */
  async _evaluateResultRoll() {
    await super._evaluateResultRoll();

    this._numObtainedKnowledge = Math.min(
      this._roll.numSuccesses,
      this._maxObtainableKnowledge,
    );
  }

  /** @inheritDoc */
  async _processRoll() {
    if ( !this._roll ) return;

    this._roll.options.chatFlavor = game.i18n.format(
      "ED.Chat.Flavor.itemHistory",
      {
        numKeyKnowledgeObtained:  this._numObtainedKnowledge,
        numMaxPossible:           this._maxObtainableKnowledge,
        typeMaxPossible:          game.i18n.localize( this._typeMaxPossible ),
      },
    );

    await super._processRoll();
  }

  async #revealKeyKnowledge() {
    if ( this._numObtainedKnowledge <= 0 ) return;

    let truePattern = this._target.system.truePattern;
    if ( !truePattern.knownToPlayer ) {
      this._target = await this._target.update( {
        "system.truePattern.knownToPlayer": true,
      } );
      truePattern = this._target.system.truePattern;
    }

    this._target = await truePattern.revealNextRanks( this._numObtainedKnowledge );
  }

}