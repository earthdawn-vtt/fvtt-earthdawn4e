import Rollable from "./rollable.mjs";
import ActorWorkflow from "./actor-workflow.mjs";
import DialogEd from "../../applications/api/dialog.mjs";
import WorkflowInterruptError from "../workflow-interrupt.mjs";
import { getSetting } from "../../settings.mjs";
import AttuningRollOptions from "../../data/roll/attuning.mjs";

/**
 * @typedef {object} AttuneGrimoireWorkflowOptions
 * @property {ItemEd} [grimoire] - The grimoire to attune. If not provided, the user will be prompted to select a grimoire.
 * @property {ItemEd} [spell] - The spell to attune to the grimoire. If not provided, the user will be prompted to select a spell.
 */

export default class AttuneGrimoireWorkflow extends Rollable( ActorWorkflow ) {

  /**
   * The patterncraft ability that is used to attune the grimoire.
   * @type {ItemEd}
   */
  _attuneAbility;

  /**
   * The grimoire that is being attuned.
   * @type {ItemEd}
   */
  _grimoire;

  /**
   * The spell that is being attuned to the grimoire.
   * @type {ItemEd}
   */
  _spell;

  /**
   * @param {ActorEd} attuningActor - The actor that is reattuning the grimoire.
   * @param {WorkflowOptions&AttuneGrimoireWorkflowOptions} options - The options for the attuning workflow.
   */
  constructor( attuningActor, options ) {
    super( attuningActor, options );

    this._rollPromptTitle = game.i18n.localize( "ED.Dialogs.RollPrompt.Title.attuneGrimoire" );

    this._grimoire = options.grimoire || null;
    this._spell = options.spell || null;

    this._steps.push(
      this.#selectGrimoire.bind( this ),
      this.#selectSpell.bind( this ),
      this.#findPatterncraftAbility.bind( this ),
      this.#createRollOptions.bind( this ),
      this._createRoll.bind( this ),
      this._processRoll.bind( this ),
      this._rollToChat.bind( this ),
    );
  }

  /**
   * The grimoire that is being attuned.
   * @type {ItemEd}
   */
  get grimoire() {
    return this._grimoire;
  }

  // region Steps

  async #selectGrimoire() {
    if ( this._grimoire ) return;

    const grimoire = await this._actor.selectGrimoire();

    if ( !grimoire ) {
      this.cancel();
      return;
    }

    this._grimoire = grimoire;
  }

  async #selectSpell() {
    if ( this._spell ) return;

    const availableSpells = Array.from( this._grimoire.system.grimoire.spells );
    if ( availableSpells.length === 0 ) {
      throw new WorkflowInterruptError(
        this,
        game.i18n.localize( "ED.Notifications.Error.noSpellsAvailableToAttune" ),
      );
    }

    const spell = await fromUuid(
      await DialogEd.waitButtonSelect(
        availableSpells,
        "ed-button-select-spell",
        {
          title: game.i18n.localize( "ED.Dialogs.Title.selectSpellToAttuneToGrimoire" ),
        },
      )
    );

    if ( !spell ) {
      this.cancel();
      return;
    }

    if ( spell.uuid === this._grimoire.system.grimoire.attunedSpell ) {
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.spellAlreadyAttunedInGrimoire" ),
      );
      this.cancel();
      return;
    }

    this._spell = spell;
  }

  async #findPatterncraftAbility() {
    if ( this._attuneAbility ) return;

    this._attuneAbility = this._actor.getSingleItemByEdid(
      getSetting( "edidPatterncraft" ),
    );
    if ( !this._attuneAbility ) {
      throw new WorkflowInterruptError(
        this,
        game.i18n.localize( "ED.Notifications.Error.grimoireAttuneAbilityNotFound" ),
      );
    }
  }

  async #createRollOptions() {
    this._rollOptions = AttuningRollOptions.fromActor(
      {
        attuningType:    "grimoire",
        attuningAbility: this._attuneAbility.uuid,
        spellsToAttune:  [ this._spell.uuid ],
        grimoirePenalty: !this._grimoire.system.isOwnGrimoire,
      },
      this._actor,
    );
  }

  async _processRoll() {
    this._roll = await this._roll.evaluate();
    this._result = this._roll;

    // If the roll was unsuccessful, don't attune anything
    // information about the failure is already shown in the roll message
    if ( this._roll.isFailure ) {
      return;
    }

    // If the roll was successful, attune the spell to the grimoire
    await this._grimoire.system.setGrimoireActiveSpell( this._spell.uuid );

    super._processRoll();
  }

  // endregion

}