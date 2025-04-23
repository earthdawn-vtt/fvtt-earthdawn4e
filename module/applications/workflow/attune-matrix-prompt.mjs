import ApplicationEd from "../api/application.mjs";
import { ED4E } from "../../../earthdawn4e.mjs";

export default class AttuneMatrixPrompt extends ApplicationEd {

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    id:       "attune-matrix-prompt-{id}",
    uniqueId: String( ++foundry.applications.api.ApplicationV2._appId ),
    classes:  [ "attune-matrix-prompt", ],
    window:   {
      title: "ED.Dialogs.Title.attuneMatrix",
    },
  };

  /** @inheritdoc */
  static PARTS = {
    main: {
      template: "systems/ed4e/templates/workflow/attune-matrix.hbs",
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
    },
  };

  /**
   * The list of available matrices.
   * @type {ItemEd[]}
   */
  #matrices;

  /**
   * The list of available spells.
   * @type {ItemEd[]}
   */
  #spells;

  constructor( { matrices = [], spells = [], options = {} } = {} ) {
    super( options );
    this.#matrices = matrices;
    this.#spells = spells;
  }

  // region Rendering

  /** @inheritdoc */
  async _preparePartContext( partId, context, options ) {
    const newContext = await super._preparePartContext( partId, context, options );

    switch ( partId ) {
      case "main": {
        newContext.matrices = this.#matrices;
        newContext.spells = this.#spells;
        break;
      }
      case "footer": {
        const buttonContinue = this.constructor.BUTTONS.continue;
        buttonContinue.icon = ED4E.icons.attune;
        buttonContinue.label = "ED.Dialogs.Buttons.attuneMatrix";
        newContext.buttons = [
          buttonContinue,
        ];
        break;
      }
      default: {
        break;
      }
    }

    return newContext;
  }

  // endregion

}