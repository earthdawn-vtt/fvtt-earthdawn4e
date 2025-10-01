import ApplicationEd from "../api/application.mjs";
import { ROLLS } from "../../config/_module.mjs";

export default class ChooseAdderSubstitutePrompt extends ApplicationEd {

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
   * Wait for dialog to be resolved.
   * @param {ActorEd} actor The actor to choose the adder or substitute for.
   * @param {string} rollType The type of roll the adder or substitute is being chosen for, e.g. "damage".
   * @param {object} [options]      Options to pass to the constructor.
   * @returns {any}                 The evaluated value.
   */
  static waitPrompt( actor, rollType, options = {} ) {
    return new Promise( ( resolve ) => {
      options.resolve = resolve;
      new this( actor, rollType, options ).render( { force: true, focus: true } );
    } );
  }

  // endregion

  /**
   * @inheritDoc
   * @param {ActorEd} actor The actor to choose the adder or substitute for.
   * @param {string} rollType The type of roll the adder or substitute is being chosen for, e.g. "damage".
   * @param {Partial<Configuration>} [options] The options to pass to the constructor. See {@link ApplicationV2} for details.
   */
  constructor( actor, rollType, options = {} ) {
    if ( !actor ) throw new TypeError( "ED4E | Cannot construct ChooseAdderSubstitutePrompt without an actor." );
    if ( !( rollType in ROLLS.rollTypes ) ) throw new TypeError( `ED4E | Cannot construct ChooseAdderSubstitutePrompt with invalid roll type ${rollType}.` );

    super( options );
    this.actor = actor;
    this.rollType = rollType;
  }

  // region Rendering

  /** @inheritdoc */
  async _preparePartContext( partId, context, options ) {
    const partContext = await super._preparePartContext( partId, context, options );

    switch ( partId ) {
      case "form": {
        partContext.actor = this.actor;
        partContext.rollTypeLocalized = game.i18n.localize( ROLLS.rollTypes[ this.rollType ].label );
        [
          partContext.adders,
          partContext.substitutes
        ] = this.actor.getAdderAndReplacementAbilities( this.rollType );
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