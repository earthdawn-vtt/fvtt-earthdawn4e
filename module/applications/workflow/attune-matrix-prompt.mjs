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
      cancelReattuning: AttuneMatrixPrompt._cancelReattuning,
      emptyAll:         AttuneMatrixPrompt._onEmptyAllMatrices,
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
   * @type {StringField}
   */
  #threadWeavingTalentField;

  /**
   * The currently selected thread weaving talent to use if reattuning on the fly.
   * @type {ItemEd}
   */
  #threadWeavingTalent;

  /**
   * Whether the matrices should be reattuned on the fly. `True` if a thread weaving talent is selected, false otherwise.
   * @type {boolean}
   */
  get #onTheFly() {
    return foundry.data.validators.isValidId( this._data.threadWeavingId );
  }

  /**
   * If a thread weaving talent for reattuning on the fly is selected, return its casting type. Null otherwise.
   * @type {string|null}
   */
  get #castingType() {
    return this.#threadWeavingTalent?.system?.rollTypeDetails?.threadWeaving?.castingType ?? null;
  }

  // endregion

  constructor( { actor, firstMatrixUuid, onTheFly = false, ...options } ) {
    super( options );
    this.#actor = actor;
    this.#matrices = actor.getMatrices();
    this._data.toAttune = this.#matrices.reduce( ( acc, matrix ) => {
      acc[ matrix.id ] = matrix.system.matrix.spells?.toObject() ?? [];
      return acc;
    }, {} );

    // sort spells: first by spellcasting type, then by name
    this.#spells = actor.itemTypes.spell.toSorted( ( a, b ) => {
      const typeComparison = a.system.spellcastingType.localeCompare( b.system.spellcastingType );
      return typeComparison !== 0 ? typeComparison : a.name.localeCompare( b.name );
    } );
    this.#firstMatrix = this.#matrices.findSplice( matrix => matrix.uuid === firstMatrixUuid );
    this.#threadWeavingTalentField = this.#getThreadWeavingTalentField();

    if ( onTheFly ) {
      const threadWeavingUuid = this.#actor.system.concentrationSource;
      this._data.threadWeavingId = foundry.utils.parseUuid( threadWeavingUuid )?.id
        ?? Object.keys( this.#threadWeavingTalentField.choices )[0];
      this.#threadWeavingTalent = fromUuidSync( threadWeavingUuid );
    }

  }

  _getSpellSelectionField( matrix ) {
    if ( !matrix ) return;
    return {
      matrix: matrix,
      field:  matrix.system.matrixShared
        ? this.#getMultipleSpellField( matrix )
        : this.#getSingleSpellField( matrix ),
      selected: this._data.toAttune[ matrix.id ],
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
      const sameCastingTypes = this.#castingType === spell.system?.spellcastingType;
      const spellInMatrix = matrix.system.isSpellAttuned( spell.uuid );
      const spellSelected = this._data.toAttune[ matrix.id ]?.includes( spell.uuid );
      if (
        ( spell.system.level > matrix.system.level )
        || ( this.#onTheFly && !spellInMatrix && !sameCastingTypes )
      ) return choices;
      choices.push( {
        valueAttr: "value",
        value:     spell.uuid,
        label:     spell.name,
        group:     ED4E.spellcastingTypes[ spell.system.spellcastingType ],
        disabled:  spellSelected && spellInMatrix,
        selected:  spellSelected,
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
      name: "threadWeavingId",
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
        newContext.threadWeavingId = this._data.threadWeavingId;
        break;
      }
      case "footer": {
        if ( this.#matrices.length > 0 ) {
          newContext.buttons = [];

          if ( this.#actor.statuses.has( "attuningOnTheFly" ) ) {
            const buttonCancel = foundry.utils.deepClone( this.constructor.BUTTONS.cancel );
            buttonCancel.label = "ED.Dialogs.Buttons.TODO.X.CancelReattuning";
            buttonCancel.action = "cancelReattuning";
            newContext.buttons.push( buttonCancel );
          }

          const buttonContinue = foundry.utils.deepClone( this.constructor.BUTTONS.continue );
          buttonContinue.icon = this.#onTheFly ? ED4E.icons.onTheFly :ED4E.icons.attune;
          buttonContinue.label = this.#onTheFly ? "ED.Dialogs.Buttons.reattuneOnTheFly" : "ED.Dialogs.Buttons.attuneMatrix";
          newContext.buttons.push( buttonContinue, );
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
    const { toAttune, threadWeavingId } = super._processSubmitData( event, form, formData, submitOptions );
    this.#threadWeavingTalent = this.#actor.items.get( threadWeavingId );
    return {
      toAttune,
      threadWeavingId,
    };
  }

  // endregion

  // region Event Handlers

  static async _cancelReattuning( event, target ) {
    this.submit();
    this.resolve?.( { cancelReattuning: true } );
    return this.close();
  }

  static async _onEmptyAllMatrices( event, target ) {}

  // endregion

}