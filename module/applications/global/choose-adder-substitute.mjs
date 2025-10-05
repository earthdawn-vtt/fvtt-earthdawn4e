import ApplicationEd from "../api/application.mjs";
import { ROLLS } from "../../config/_module.mjs";

export default class ChooseAdderSubstitutePrompt extends ApplicationEd {

  /**
   * @typedef {object} ChooseAdderSubstitutePromptResult
   * @property {string} replacementAbilityUuid The uuid chosen adder ability, empty string if none was chosen.
   * @property {string[]} increaseAbilityUuids The uuids of the chosen substitute abilities, empty array if none was chosen.
   */

  // region Static Properties

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    id:       "choose-adder-substitute-prompt-{id}",
    uniqueId: String( ++foundry.applications.api.ApplicationV2._appId ),
    classes:  [ "choose-adder-substitute-prompt", ],
    window:   {
      positioned:     true,
      icon:           "",
      minimizable:    false,
      resizable:      true,
      title:          "ED.Dialogs.Title.chooseAdderSubstitute",
    },
  };

  /** @inheritdoc */
  static PARTS = {
    form:   {
      template: "systems/ed4e/templates/prompts/choose-adder-substitute.hbs",
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
      classes:  [ "flexrow" ],
    },
  };

  // endregion

  // region Static Methods

  /**
   * Factory method for asynchronous behavior. Displays this application and waits for user input.
   * @param {ActorEd} actor The actor to choose the adder or substitute for.
   * @param {string} rollType The type of roll the adder or substitute is being chosen for, e.g. "damage".
   * @param {object} [options]      Options to pass to the constructor.
   * @returns {Promise<ChooseAdderSubstitutePromptResult>}  A promise that resolves to an object with the chosen abilities.
   */
  static async waitPrompt( actor, rollType, options = {} ) {
    return new Promise( ( resolve ) => {
      options.resolve = resolve;
      new this( actor, rollType, options ).render( { force: true, focus: true } );
    } );
  }

  /**
   * Factory method for asynchronous behavior. Checks if the actor has any adder or substitute abilities
   * for the given roll type, and if so, displays this application and waits for user input.
   * @param {ActorEd} actor The actor to choose the adder or substitute for.
   * @param {string} rollType The type of roll the adder or substitute is being chosen for, e.g. "damage".
   * @param {object} [options]      Options to pass to the constructor.
   * @returns {Promise<ChooseAdderSubstitutePromptResult|null>}  A promise that resolves to an object with the chosen abilities,
   * or null if no abilities were available.
   */
  static async waitPromptIfAbilitiesAvailable( actor, rollType, options = {} ) {
    if ( !actor ) throw new TypeError( "ED4E | Cannot call ChooseAdderSubstitutePrompt.waitPromptIfAbilitiesAvailable without an actor." );

    const { adders, substitutes } = actor.getModifierAbilities( rollType );
    if ( adders.length === 0 && substitutes.length === 0 ) return null;
    options.abilities = { adders, substitutes };
    return this.waitPrompt( actor, rollType, options );
  }

  // endregion

  /**
   * @inheritDoc
   * @param {ActorEd} actor The actor to choose the adder or substitute for.
   * @param {string} rollType The type of roll the adder or substitute is being chosen for, e.g. "damage".
   * @param {object} [options] The options to pass to the constructor. See {@link ApplicationV2} for details.
   * @param {object} [options.abilities] The abilities to choose from.
   * @param {object} [options.abilities.adders] The adder abilities to choose from.
   * @param {object} [options.abilities.substitutes] The substitute abilities to choose from.
   */
  constructor( actor, rollType, options = {} ) {
    if ( !actor ) throw new TypeError( "ED4E | Cannot construct ChooseAdderSubstitutePrompt without an actor." );
    if ( !( rollType in ROLLS.rollTypes ) ) throw new TypeError( `ED4E | Cannot construct ChooseAdderSubstitutePrompt with invalid roll type ${rollType}.` );

    super( options );
    this._actor = actor;
    this._rollType = rollType;

    const { adders, substitutes } = options.abilities ?? this._actor.getModifierAbilities( this._rollType );
    this._adders = adders;
    this._substitutes = substitutes;
  }

  // region Rendering

  /** @inheritdoc */
  async _preparePartContext( partId, context, options ) {
    const partContext = await super._preparePartContext( partId, context, options );

    switch ( partId ) {
      case "form": {
        partContext.actor = this._actor;
        partContext.rollTypeLocalized = game.i18n.localize( ROLLS.rollTypes[ this._rollType ].label );
        partContext.adders = this._adders;
        partContext.substitutes = this._substitutes;
        break;
      }
      case "footer": {
        partContext.buttons = this.constructor.BUTTONS;
      }
    }

    return partContext;
  }

  // endregion

}