import ApplicationEd from "../api/application.mjs";
import * as MAGIC from "../../config/magic.mjs";
import * as SYSTEMS from "../../config/system.mjs";

/**
 * @import { DocumentUuid } from "../../_types.mjs";
 */

/**
 * The prompt for managing the attunement of matrices for an actor.
 * @augments {ApplicationEd}
 */
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

  /**
   * Constructs an instance with the provided configuration. Initializes actor-based matrices, resolves attune data,
   * sorts spells, and sets up thread weaving talent based on input parameters.
   *
   * @param {object} params The configuration object for the constructor.
   * @param {ActorEd} params.actor The actor containing relevant matrices and spell data.
   * @param {DocumentUuid} params.firstMatrixUuid The unique identifier for the spell matrix shown on top.
   * @param {boolean} [params.onTheFly=false] A flag to determine whether attuning is happening on-the-fly.
   * @param {Object} [params.options] Additional options to be passed to the parent class constructor.
   * @return {AttuneMatrixPrompt} A new instance of AttuneMatrixPrompt.
   */
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
      const threadWeavingId = this.#actor.system.concentrationSource;
      this._data.threadWeavingId = threadWeavingId ?? Object.keys( this.#threadWeavingTalentField.choices )[0];
      this.#threadWeavingTalent = this.#actor.items.get( this._data.threadWeavingId );
    }

  }

  /**
   * Creates a data field for selecting spells to be attuned to a matrix.
   * @param {ItemEd} matrix The matrix item.
   * @return {SpellSelectionFieldConfig} The data field configuration.
   */
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

  /**
   * Creates a data field for selecting multiple spells to be attuned to a matrix.
   * @param {ItemEd} matrix The matrix item.
   * @return {DataField} The data field for selecting multiple spells.
   */
  #getMultipleSpellField( matrix ) {
    return new foundry.data.fields.SetField( new foundry.data.fields.StringField( {
      choices:  this.#getSpellChoicesConfig( matrix ),
    } ), {
      label:    matrix.name,
    }, {
      name:     `toAttune.${matrix.id}`,
    } );
  }

  /**
   * Creates a data field for selecting a single spell to be attuned to a matrix.
   * @param {ItemEd} matrix The matrix item.
   * @return {DataField} The data field for selecting a single spell.
   */
  #getSingleSpellField( matrix ) {
    return new foundry.data.fields.StringField( {
      label:    matrix.name,
      choices:  this.#getSpellChoicesConfig( matrix ),
    }, {
      name:     `toAttune.${matrix.id}`,
    } );
  }

  /**
   * Generates the choices configuration for a spell selection field.
   * @param {ItemEd} matrix The matrix item.
   * @return {object[]} The `choices` configuration.
   */
  #getSpellChoicesConfig( matrix ) {
    return this.#spells.reduce( ( choices, spell ) => {
      const sameCastingTypes = this.#castingType === spell.system?.spellcastingType;
      const spellInMatrix = matrix.system.isSpellAttuned( spell.id );
      const spellSelected = this._data.toAttune[ matrix.id ]?.includes( spell.id );
      if (
        ( spell.system.level > matrix.system.level )
        || ( this.#onTheFly && !spellInMatrix && !sameCastingTypes )
      ) return choices;
      choices.push( {
        valueAttr: "value",
        value:     spell.id,
        label:     spell.name,
        group:     MAGIC.spellcastingTypes[ spell.system.spellcastingType ],
        disabled:  spellSelected && spellInMatrix,
        selected:  spellSelected,
      } );
      return choices;
    }, [] );
  }

  /**
   * Creates a data field for selecting a thread weaving talent to use if reattuning on the fly.
   * @return {StringField} The data field for selecting a thread weaving talent.
   */
  #getThreadWeavingTalentField() {
    const threadWeavingTalents = this.#actor.items.filter(
      item => item.system?.rollTypeDetails?.threadWeaving?.castingType in MAGIC.spellcastingTypes,
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
            buttonCancel.label = "ED.Dialogs.Buttons.cancelReattuning";
            buttonCancel.action = "cancelReattuning";
            newContext.buttons.push( buttonCancel );
          }

          const buttonContinue = foundry.utils.deepClone( this.constructor.BUTTONS.continue );
          buttonContinue.icon = this.#onTheFly ? SYSTEMS.icons.onTheFly :SYSTEMS.icons.attune;
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

  /** @inheritdoc */
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

  /**
   * Cancels the attuning process and closes the prompt.
   * @type {ApplicationClickAction}
   */
  static async _cancelReattuning( event, target ) {
    this.submit();
    this.resolve?.( { cancelReattuning: true } );
    return this.close();
  }

  /**
   * Removes all spells from all matrix fields.
   * @type {ApplicationClickAction}
   */
  static async _onEmptyAllMatrices( event, target ) {
    Object.keys( this._data.toAttune ).forEach( key => {
      this._data.toAttune[key] = "";
    } );
    this.render();
  }

  // endregion

}