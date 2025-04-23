import ApplicationEd from "../api/application.mjs";
import { ED4E } from "../../../earthdawn4e.mjs";

export default class AttuneMatrixPrompt extends ApplicationEd {

  // region Properties
  
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

  /**
   * A list of data fields to be used with {@link DataField#toFormGroup} as input for the spell selection.
   * @type {DataField[]}
   */
  #spellSelectionFields;

  /**
   * The UUIDs of available spells.
   * @type {string[]}
   */
  get #spellsUuids() {
    return this.#spells.map( ( spell ) => spell.uuid );
  }

  // endregion

  constructor( { matrices = [], spells = [], options = {} } = {} ) {
    super( options );
    this.#matrices = matrices;
    this.#spells = spells;
    this.#spellSelectionFields = Array.from( this.#matrices.map( matrix => {
      return {
        matrix: matrix,
        field:  matrix.shared
          ? this.#getMultipleSpellField( matrix )
          : this.#getSingleSpellField( matrix ),
        selected: matrix.shared
          ? matrix.spells
          : matrix.spell,
      };
    } ) );
  }

  // region Rendering

  /** @inheritdoc */
  async _preparePartContext( partId, context, options ) {
    const newContext = await super._preparePartContext( partId, context, options );

    switch ( partId ) {
      case "main": {
        newContext.spellSelectionFields = this.#spellSelectionFields;
        break;
      }
      case "footer": {
        if ( this.#matrices.length > 0 ) {
          const buttonContinue = this.constructor.BUTTONS.continue;
          buttonContinue.icon = ED4E.icons.attune;
          buttonContinue.label = "ED.Dialogs.Buttons.attuneMatrix";
          newContext.buttons = [
            buttonContinue
          ];
        } else {
          newContext.buttons = [
            this.constructor.BUTTONS.cancel,
          ];
        }
        break;
      }
      default: {
        break;
      }
    }

    return newContext;
  }

  // endregion

  #getMultipleSpellField( matrix ) {
    return new foundry.data.fields.SetField( new foundry.data.fields.DocumentUUIDField( {
      type:     "Item",
      embedded: true,
    } ), {
      label:     matrix.name,
      choices:   this.#spellsUuids,
    } );
  }

  #getSingleSpellField( matrix ) {
    return new foundry.data.fields.DocumentUUIDField( {
      label:     matrix.name,
    } );
  }

}