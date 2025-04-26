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

  // endregion

  constructor( { matrices = [], spells = [], ...options } ) {
    super( options );
    this.#matrices = matrices;
    // sort spells: first by spellcasting type, then by name
    this.#spells = spells.toSorted( ( a, b ) => {
      const typeComparison = a.system.spellcastingType.localeCompare( b.system.spellcastingType );
      return typeComparison !== 0 ? typeComparison : a.name.localeCompare( b.name );
    } );

    this.#spellSelectionFields = Array.from( this.#matrices.map( matrix => {
      return {
        matrix: matrix,
        field:  matrix.system.matrixShared
          ? this.#getMultipleSpellField( matrix )
          : this.#getSingleSpellField( matrix ),
        selected: matrix.matrixShared
          ? matrix.system.matrix.spells ?? []
          : matrix.system.matrixSpellUuid,
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
    return new foundry.data.fields.SetField( new foundry.data.fields.StringField( {
      choices:  this.#getSpellChoicesConfig( matrix ),
    } ), {
      name:     matrix.name,
      label:    matrix.name,
    } );
  }

  #getSingleSpellField( matrix ) {
    return new foundry.data.fields.StringField( {
      name:     matrix.name,
      label:    matrix.name,
      choices:  this.#getSpellChoicesConfig( matrix ),
    } );
  }

  #getSpellChoicesConfig( matrix ) {
    return this.#spells.reduce( ( choices, spell ) => {
      if ( spell.system.level > matrix.system.level ) return choices;
      choices.push( {
        valueAttr: "value",
        value:     spell.uuid,
        label:     spell.name,
        group:     ED4E.spellcastingTypes[ spell.system.spellcastingType ],
        disabled:  matrix.system.isSpellAttuned( spell.uuid ),
        selected:  matrix.system.isSpellAttuned( spell.uuid ),
      } );
      return choices;
    }, [] );
  }

}