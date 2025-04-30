import ApplicationEd from "../api/application.mjs";
import { ED4E } from "../../../earthdawn4e.mjs";

export default class AttuneMatrixPrompt extends ApplicationEd {

  /**
   * @typedef {object} SpellSelectionFieldConfig
   * @property {ItemEd} matrix The matrix item.
   * @property {DataField} field The field to be used for the spell selection.
   * @property {string[]|string} selected The selected spell(s).
   */

  // region Properties
  
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    id:       "attune-matrix-prompt-{id}",
    uniqueId: String( ++foundry.applications.api.ApplicationV2._appId ),
    classes:  [ "attune-matrix-prompt", ],
    form:     {
      submitOnChange: true,
    },
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
   * A matrix that should be shown first in the list, with others collapsed.
   * @type {SpellSelectionFieldConfig}
   */
  #firstSpellSelectionField;

  // endregion

  constructor( { actor, firstMatrix: firstMatrixUuid, ...options } ) {
    super( options );
    this.#matrices = actor.getMatrices();
    // sort spells: first by spellcasting type, then by name
    this.#spells = actor.itemTypes.spell.toSorted( ( a, b ) => {
      const typeComparison = a.system.spellcastingType.localeCompare( b.system.spellcastingType );
      return typeComparison !== 0 ? typeComparison : a.name.localeCompare( b.name );
    } );

    if ( firstMatrixUuid ) {
      this.#firstSpellSelectionField = this._getSpellSelectionField(
        this.#spells.findSplice( matrix => matrix.uuid === firstMatrixUuid )
      );
    }
  }

  _getSpellSelectionField( matrix ) {
    return {
      matrix: matrix,
      field:  matrix.system.matrixShared
        ? this.#getMultipleSpellField( matrix )
        : this.#getSingleSpellField( matrix ),
      selected: matrix.system.matrixShared
        ? matrix.system.matrix.spells
        : matrix.system.matrixSpellUuid
    };
  }

  // region Rendering

  /** @inheritdoc */
  async _preparePartContext( partId, context, options ) {
    const newContext = await super._preparePartContext( partId, context, options );

    switch ( partId ) {
      case "main": {
        newContext.firstField = this.#firstSpellSelectionField;
        newContext.spellSelectionFields = Array.from( this.#matrices.map( matrix => {
          return this._getSpellSelectionField( matrix );
        } ) );
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
      label:    matrix.name,
    }, {
      name:     matrix.id,
    } );
  }

  #getSingleSpellField( matrix ) {
    return new foundry.data.fields.StringField( {
      label:    matrix.name,
      choices:  this.#getSpellChoicesConfig( matrix ),
    }, {
      name:     matrix.id,
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