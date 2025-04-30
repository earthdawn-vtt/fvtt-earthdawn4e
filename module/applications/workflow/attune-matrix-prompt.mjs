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
      closeOnSubmit:  false,
      submitOnChange: true,
    },
    actions:  {
      emptyAll: AttuneMatrixPrompt._onEmptyAllMatrices,
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
   * The actor who is trying to attune.
   * @type {ActorEd}
   */
  #actor;

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
   * @type {ItemEd}
   */
  #firstMatrix;

  /**
   * The data field to select the thread weaving talent to use if reattuning on the fly.
   * @type {ItemEd}
   */
  #threadWeavingTalentField;

  /**
   * Whether the matrices should be reattuned on the fly. `True` if a thread weaving talent is selected, false otherwise.
   * @type {boolean}
   */
  get #onTheFly() {
    return foundry.data.validators.isValidId( this._data.threadWeavingUuid );
  }

  // endregion

  constructor( { actor, firstMatrixUuid, onTheFly = false, ...options } ) {
    super( options );
    this.#actor = actor;
    this.#matrices = actor.getMatrices();
    // sort spells: first by spellcasting type, then by name
    this.#spells = actor.itemTypes.spell.toSorted( ( a, b ) => {
      const typeComparison = a.system.spellcastingType.localeCompare( b.system.spellcastingType );
      return typeComparison !== 0 ? typeComparison : a.name.localeCompare( b.name );
    } );
    this.#firstMatrix = this.#matrices.findSplice( matrix => matrix.uuid === firstMatrixUuid );
    this.#threadWeavingTalentField = this.#getThreadWeavingTalentField();

    if ( onTheFly ) {
      this._data.threadWeavingUuid = Object.keys( this.#threadWeavingTalentField.choices )[0];
    }
  }

  _getSpellSelectionField( matrix ) {
    if ( !matrix ) return;
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

  #getMultipleSpellField( matrix ) {
    return new foundry.data.fields.SetField( new foundry.data.fields.StringField( {
      choices:  this.#getSpellChoicesConfig( matrix ),
    } ), {
      label:    matrix.name,
    }, {
      name:     `toAttune.${matrix.id}`,
    } );
  }

  #getSingleSpellField( matrix ) {
    return new foundry.data.fields.StringField( {
      label:    matrix.name,
      choices:  this.#getSpellChoicesConfig( matrix ),
    }, {
      name:     `toAttune.${matrix.id}`,
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

  #getThreadWeavingTalentField() {
    const threadWeavingTalents = this.#actor.items.filter(
      item => item.system?.rollTypeDetails?.threadWeaving?.castingType in ED4E.spellcastingTypes,
    );
    const choices = threadWeavingTalents.reduce( ( acc, talent ) => {
      acc[talent.id] = talent.name;
      return acc;
    }, {} );

    return new foundry.data.fields.StringField( {
      choices,
      label:    "",
      hint:     "ED.X.TODO.Choose a thread weaving talent to attune on the fly",
    }, {
      name: "threadWeavingUuid",
    } );
  }

  // region Rendering

  /** @inheritdoc */
  async _preparePartContext( partId, context, options ) {
    const newContext = await super._preparePartContext( partId, context, options );

    switch ( partId ) {
      case "main": {
        newContext.firstField = this._getSpellSelectionField( this.#firstMatrix );
        newContext.spellSelectionFields = Array.from( this.#matrices.map( matrix => {
          return this._getSpellSelectionField( matrix );
        } ) );
        newContext.threadWeavingField = this.#threadWeavingTalentField;
        newContext.threadWeavingUuid = this._data.threadWeavingUuid;
        break;
      }
      case "footer": {
        if ( this.#matrices.length > 0 ) {
          const buttonContinue = this.constructor.BUTTONS.continue;
          buttonContinue.icon = this.#onTheFly ? ED4E.icons.onTheFly :ED4E.icons.attune;
          buttonContinue.label = this.#onTheFly ? "ED.Dialogs.Buttons.reattuneOnTheFly" : "ED.Dialogs.Buttons.attuneMatrix";
          newContext.buttons = [
            buttonContinue,
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

  // region Form Handling

  _processSubmitData ( event, form, formData, submitOptions ) {
    const { toAttune, threadWeavingUuid} = super._processSubmitData( event, form, formData, submitOptions );
    return {
      toAttune,
      threadWeavingUuid,
    };
  }

  // endregion

  // region Event Handlers

  static async _onEmptyAllMatrices( event, target ) {}

  // endregion

}