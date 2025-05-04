import ActorWorkflow from "./actor-workflow.mjs";
import AttuneMatrixPrompt from "../../applications/workflow/attune-matrix-prompt.mjs";
import RollPrompt from "../../applications/global/roll-prompt.mjs";
import AttuningRollData from "../../data/roll/attuning.mjs";

/**
 * @typedef {object} AttuneMatrixWorkflowOptions
 * @property {string} firstMatrix The UUID for a matrix that should be focused when displaying the attune matrix prompt.
 */

export default class AttuneWorkflow extends ActorWorkflow {

  /**
   * The result of the attuning roll, if performed.
   * @type {EdRoll|null}
   */
  _attuneRoll = null;

  /**
   * An optional ability with which an attune test should be rolled. "Patterncraft"
   * for attuning grimoires, "Thread Weaving" for attuning matrices.
   * @type {ItemEd}
   */
  _attuneAbility;

  /**
   *
   * @type {string}
   */
  _firstMatrixUuid;

  /**
   * Flag to track if reattuning is being explicitly canceled.
   * @type {boolean}
   * @private
   */
  _isCancelingReattuning;

  /**
   * A mapping defining which spells should be attuned to which matrix.
   * Keys are the IDs of the matrix to which to attune the values, arrays of spell uuids.
   * @type {{[matrixId: string]: string[]}}
   */
  _toAttune;

  /**
   * @param {ActorEd} attuningActor - The actor that is reattuning the matrices.
   * @param {WorkflowOptions&AttuneMatrixWorkflowOptions} options - The options for the attuning workflow.
   */
  constructor( attuningActor, options ) {
    super( attuningActor, options );
    const { firstMatrix } = options;

    this._firstMatrixUuid = firstMatrix;

    this._steps.push(
      this.#promptForAttuneConfiguration.bind( this ),
      this.#checkIfReattuningOnTheFly.bind( this ),
      this.#handleReattuningCancellation.bind( this ),
      this.#rollForReattuningSuccess.bind( this ),
      this.#handleReattuningFailure.bind( this ),
      this.#attuneSpellsToMatrices.bind( this )

      // do grimoire stuff in another branch/pull request
    );

  }

  /**
   * Gets user input for attuning configuration using AttuneMatrixPrompt.
   * @returns {Promise<void>}
   */
  async #promptForAttuneConfiguration() {
    const response = await AttuneMatrixPrompt.waitPrompt( {
      actor:           this._actor,
      firstMatrixUuid: this._firstMatrixUuid,
      onTheFly:        this._actor.statuses.has( "attuningOnTheFly" ),
    } );
    if ( !response ) {
      this.cancel();
      return;
    }

    // Check if reattunement was explicitly canceled
    if ( response.cancelReattuning ) {
      this._isCancelingReattuning = true;
      return;
    }

    const { toAttune, threadWeavingId } = response;
    this._toAttune = toAttune;
    this._attuneAbility = this._actor.items.get( threadWeavingId );
  }

  /**
   * Checks if the actor is currently reattuning on the fly by looking for the "attuningOnTheFly" status.
   * @returns {Promise<void>}
   */
  async #checkIfReattuningOnTheFly() {
    // Skip this step if we don't have an ability for reattuning on the fly
    this._isReattuningOnTheFly = !!this._attuneAbility;
  }

  /**
   * If the user decided not to continue reattuning on the fly, dislodges all spells and stops the workflow.
   * @returns {Promise<void>}
   */
  async #handleReattuningCancellation() {
    // This step only executes if we're reattuning on the fly and the user chose not to continue,
    // so we need to dislodge all spells from matrices and stop
    if ( !this._isCancelingReattuning ) return;

    // Remove the attuningOnTheFly status
    await this._actor.toggleStatusEffect(
      "attuningOnTheFly",
      {
        active: false,
      },
    );

    // Dislodge all spells from matrices
    await this._actor.emptyAllMatrices();

    // Notify the user
    ui.notifications.info( game.i18n.localize( "ED.Notifications.Info.ReattuningCancelled" ) );

    this._result = true;
  }

  /**
   * Rolls for reattuning success if reattuning on the fly.
   * @returns {Promise<void>}
   */
  async #rollForReattuningSuccess() {
    // Skip the roll if we're not reattuning on the fly
    if ( !this._isReattuningOnTheFly ) return;

    const rollOptions = AttuningRollData.fromActor(
      {
        attuningType:    "matrixOnTheFly",
        attuningAbility: this._attuneAbility.uuid,
        spellsToAttune:  Object.values( this._toAttune ).flat(),
      },
      this._actor,
      {},
    );

    this._attuneRoll = await RollPrompt.waitPrompt(
      rollOptions,
      {
        rollData: this._actor.getRollData(),
      },
    );
    await this._attuneRoll.toMessage();
    this._isReattuningSuccessful = this._attuneRoll.isSuccess;
  }

  /**
   * If the reattuning roll was unsuccessful, adds the "attuningOnTheFly" status to the actor and stops the workflow.
   * @returns {Promise<void>}
   */
  async #handleReattuningFailure() {
    // Skip this step if not reattuning on the fly or if the roll was successful
    if ( !this._isReattuningOnTheFly || this._isReattuningSuccessful ) return;

    // Add the attuningOnTheFly status to the actor
    await this._actor.toggleStatusEffect(
      "attuningOnTheFly",
      {
        active:  true,
      },
    );
    await this._actor.update( {
      "system.concentrationSource": this._attuneAbility.uuid,
    } );

    this.cancel();
  }

  /**
   * Attunes the selected spells to the selected matrices.
   * @returns {Promise<void>}
   */
  async #attuneSpellsToMatrices() {
    // If we're successfully reattuning on the fly, remove the status
    if ( this._isReattuningOnTheFly && this._isReattuningSuccessful ) {
      await this._actor.toggleStatusEffect(
        "attuningOnTheFly",
        {
          active:  false,
        },
      );
    }

    // Update each matrix with its new spell configuration
    const updates = Object.entries( this._toAttune ).map( ( [ matrixId, toAttune ] ) => {
      const spells = (
        Array.isArray( toAttune ) ? toAttune : [ toAttune ]
      ).filter( spellUuid => !!spellUuid );
      return {
        _id:                    matrixId,
        "system.matrix.spells": spells,
      };
    } );

    // Apply the updates if we have any
    if ( updates.length > 0 ) {
      await this._actor.updateEmbeddedDocuments( "Item", updates );
    }

    // Set the result to true to indicate success
    this._result = true;
  }
}