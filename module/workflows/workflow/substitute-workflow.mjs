import ActorWorkflow from "./actor-workflow.mjs";
import Rollable from "./rollable.mjs";
import EdRollOptions from "../../data/roll/common.mjs";
import ED4E from "../../config/_module.mjs";
import DialogEd from "../../applications/api/dialog.mjs";

const DialogClass = DialogEd;

/**
 * Workflow for handling actor substituting an Ability with an Attribute
 * @typedef {object} SubstituteWorkflowOptions
 * @property {string} attributeId - The attribute ID to use for the substitute roll.
 */

/**
 * Workflow for handling actor substituting an ability with an attribute roll
 * @mixes Rollable
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
   * @param {ActorEd} actor The actor performing the attribute roll to substitute an Ability
   * @param {SubstituteWorkflowOptions} [options] Options for the substitute workflow
   */
  constructor( actor, options = {} ) {
    super( actor, options );
    if ( !options.attributeId || !( options.attributeId in ED4E.attributes ) ) {
      ui.notifications.error(
        game.i18n.localize( "ED.Notifications.Error.substituteAttributeNotFound" ),
      );
    }
    this._rollToMessage = true;
    this._attributeId = options.attributeId;

    this._steps = [
      this._chooseSubstituteAbility.bind( this ),
      this._chooseAlternativeWorkflow.bind( this ),
    ];

    this._initRollableSteps();
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
      // check for namegiver item with tail attack
      if ( key === "tailAttack" ) {     
        const namegivers = this._actor.items.filter( i => i.type === "namegiver" );
        if ( namegivers[0]?.system.tailAttack !== true ) continue;
      }
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
      this.cancel();
      await this._actor.attack( this._attackType );
    } 
  }

  /** @inheritDoc */
  async _prepareRollOptions() {
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
}
