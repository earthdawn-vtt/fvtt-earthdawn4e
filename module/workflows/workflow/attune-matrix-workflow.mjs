import ActorWorkflow from "./actor-workflow.mjs";
import AttuneMatrixPrompt from "../../applications/workflow/attune-matrix-prompt.mjs";
import RollPrompt from "../../applications/global/roll-prompt.mjs";
import AttuningRollData from "../../data/roll/attuning.mjs";
import Rollable from "./rollable.mjs";

/**
 * @typedef {object} AttuneMatrixWorkflowOptions
 * @property {string} firstMatrix The UUID for a matrix that should be focused when displaying the attune matrix prompt.
 * @property {boolean} [onTheFly=false] Whether the attunement is happening on the fly during casting.
 */

export default class AttuneMatrixWorkflow extends Rollable( ActorWorkflow ) {

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
   * Is the attuning being done on the fly?
   * @type {boolean}
   */
  _isReattuningOnTheFly;

  /**
   * @param {ActorEd} attuningActor - The actor that is reattuning the matrices.
   * @param {WorkflowOptions&AttuneMatrixWorkflowOptions} options - The options for the attuning workflow.
   */
  constructor( attuningActor, options ) {
    super( attuningActor, options );
    const { firstMatrix } = options;

    this._firstMatrixUuid = firstMatrix;
    this._isReattuningOnTheFly = options.onTheFly;

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

  // region Steps

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
    this._toAttune = this.#filterUnchangedMatrices( toAttune );
    this._attuneAbility = this._actor.items.get( threadWeavingId );
  }

  /**
   * Checks if the actor is currently reattuning on the fly by looking for the "attuningOnTheFly" status.
   * @returns {Promise<void>}
   */
  async #checkIfReattuningOnTheFly() {
    this._isReattuningOnTheFly ??= this._actor.statuses.has( "attuningOnTheFly" ) || !!this._attuneAbility;
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
    ui.notifications.info( game.i18n.localize( "ED.Notifications.Info.reattuningCancelled" ) );

    this._result = false;
  }

  /**
   * Rolls for reattuning success if reattuning on the fly.
   * @returns {Promise<void>}
   */
  async #rollForReattuningSuccess() {
    // Skip the roll if we're not reattuning on the fly
    if ( !this._isReattuningOnTheFly ) return;

    this._rollOptions = AttuningRollData.fromActor(
      {
        attuningType:    "matrixOnTheFly",
        attuningAbility: this._attuneAbility.uuid,
        spellsToAttune:  Object.values(
          this._toAttune
        ).flat().map(
          spellId => foundry.utils.buildUuid( { id: spellId, parent: this._actor } )
        ),
        itemsToAttuneTo: Object.keys( this._toAttune ).map( id => this._actor.items.get( id ).uuid ),
      },
      this._actor,
      {},
    );

    this._roll = await RollPrompt.waitPrompt(
      this._rollOptions,
      {
        rollData: this._actor.getRollData(),
      },
    );
    await this._roll.toMessage();
    this._isReattuningSuccessful = this._roll.isSuccess;
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
      "system.concentrationSource": this._attuneAbility.id,
    } );

    this.cancel();
  }

  /**
   * Attunes the selected spells to the selected matrices.
   * @returns {Promise<void>}
   */
  async #attuneSpellsToMatrices() {
    if ( this._isCancelingReattuning ) return;

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
      ).filter( spellId => !!spellId );
      return {
        _id:                    matrixId,
        "system.matrix.spells": spells,
      };
    } );

    let updatedDocuments;
    // Apply the updates if we have any
    if ( updates.length > 0 ) {
      updatedDocuments = await this._actor.updateEmbeddedDocuments( "Item", updates );
    }

    // Set the result to true to indicate success
    this._result = updatedDocuments?.length > 0;
  }

  // endregion

  /**
   * Removes entries from the toAttune object where the matrix spell configuration hasn't changed.
   * @param {object} toAttune - The object mapping matrix IDs to their selected spell UUIDs.
   * @returns {{[matrixId: string]: string[]}} - A filtered copy of the toAttune object with only changed matrices.
   */
  #filterUnchangedMatrices( toAttune ) {
    if ( !toAttune ) return {};

    const matrices = this._actor.getMatrices();
    const result = {};

    for ( const [ matrixId, selectedSpells ] of Object.entries( toAttune ) ) {
      const matrix = matrices.find( m => m.id === matrixId );
      if ( !matrix ) continue;

      // Convert to arrays for comparison if needed
      const selected = Array.isArray( selectedSpells ) ? selectedSpells : [ selectedSpells ].filter( Boolean );
      const current = matrix.system.matrix.spells?.toObject() ?? [];

      // Check if the configuration has changed
      const hasChanged = ( () => {
        // Different lengths mean different configuration
        if ( selected.length !== current.length ) return true;

        // Check if every selected spell is already in the current configuration
        // and if every current spell is in the selected configuration
        const allSelectedInCurrent = selected.every( spell => current.includes( spell ) );
        const allCurrentInSelected = current.every( spell => selected.includes( spell ) );

        return !( allSelectedInCurrent && allCurrentInSelected );
      } )();

      // Only include this matrix if its configuration has changed
      if ( hasChanged ) {
        result[matrixId] = selectedSpells;
      }
    }

    return result;
  }

}