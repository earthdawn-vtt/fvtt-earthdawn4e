import ActorWorkflow from "./actor-workflow.mjs";
import Rollable from "./rollable.mjs";
import RollProcessor from "../../services/roll-processor.mjs";
import EdRollOptions from "../../data/roll/common.mjs";
import ED4E from "../../config/_module.mjs";
import DialogEd from "../../applications/api/dialog.mjs";

const DialogClass = DialogEd;

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
   * action
   * @type {string}
   * @private
   */
  _action;

  /**
   * attack type, optional parameter from buttons
   * @type {string}
   * @private
   */
  _attackType;

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
    if ( !options.attributeId || !( options.attributeId in ED4E.attributes ) ) {
      ui.notifications.error(
        game.i18n.localize( "ED.Notifications.Error.substituteAttributeNotFound" ),
      );
    }
    this._attributeId = options.attributeId;

    this._steps = [
      this._chooseSubstituteAbility.bind( this ),
      this._chooseAlternativeWorkflow.bind( this ),
      this._prepareSubstituteRollOptions.bind( this ),
      this._performSubstituteRoll.bind( this ),
      this._processSubstituteRoll.bind( this ),
    ];
  }

  /**
   * Chooses the substitute ability for the roll
   * @returns {Promise<void>}
   * @private
   */
  async _chooseSubstituteAbility() {
    const buttons = await this.#getAbilityButtonByAttribute( this._attributeId );

    return DialogClass.wait( {
      rejectClose: false,
      id:          "substitute-prompt",
      uniqueId:    String( ++foundry.applications.api.ApplicationV2._appId ),
      classes:     [ "earthdawn4e", "substitute-prompt flexcol" ],
      window:      {
        title:       "ED.Dialogs.Title.substitute",
        minimizable: false
      },
      modal:   false,
      buttons: buttons
    } );
  }

  async #getAbilityButtonByAttribute( attributeId ) {
    const modes = ED4E.WORKFLOWS.substituteModes[attributeId];
    if ( !modes ) return [];

    // Build button data for each mode
    const buttons = [];
    for ( const [ key, mode ] of Object.entries( modes ) ) {
      buttons.push( {
        action:   `${mode.rollType}:${key}`,
        label:    game.i18n.localize( mode.label ),
        icon:     "",
        class:    `button-standard substitute-ability ${key}`,
        default:  false,
        callback: () => {
        // Set the action and modeKey immediately after click
          this._action = mode.rollType;
          this._substituteName = game.i18n.localize( mode.label );
          if ( mode.attackType ) {
            this._attackType = mode.attackType;
          }
          console.log( `Button clicked: ${mode.rollType}:${key}` );
        }
      } );
    }
    return buttons;
  }

  /**
   * Choose the workflow based on the selected button
   * @returns {Promise<void>}
   * @private
   */
  async _chooseAlternativeWorkflow( ) {
    if ( this._action === "attack" ) {
      return this._actor.attack( this._attackType );
    } 
  }

  /**
   * Prepares the half magic roll options
   * @returns {Promise<void>}
   * @private
   */
  async _prepareSubstituteRollOptions() {
    if ( this._action !== "ability" ) return; // Only run for ability
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
        rollType: "ability",
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
    if ( this._action !== "ability" ) return; // Only run for ability
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
    if ( this._action !== "ability" ) return; // Only run for ability
    await RollProcessor.process( this._roll, this._actor, { rollToMessage: true, } );
  }

}
