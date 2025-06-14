import ApplicationEd from "../api/application.mjs";
import { ED4E } from "../../../earthdawn4e.mjs";

export default class SelectExtraThreadsPrompt extends ApplicationEd {

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    id:       "select-extra-threads-prompt-{id}",
    uniqueId: String( ++foundry.applications.api.ApplicationV2._appId ),
    classes:  [ "select-extra-threads-prompt", ],
    form:     {
      closeOnSubmit:  false,
      submitOnChange: true,
    },
    actions:  {
      continue: SelectExtraThreadsPrompt._continue,
    },
    window:   {
      title: "ED.Dialogs.Title.selectExtraThreads",
    },
  };

  /** @inheritdoc */
  static PARTS = {
    main: {
      template: "systems/ed4e/templates/workflow/select-extra-threads.hbs",
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
    },
  };

  // region Properties

  /**
   * The spell to which extra threads are being added.
   * @type {ItemEd}
   */
  #spell;

  /**
   * The actor casting the spell.
   * @type {ActorEd}
   */
  #caster;

  /**
   * The discipline of the actor for the spell being cast.
   */
  #discipline;

  /**
   * The maximum number of extra threads that can be selected.
   * @type {number}
   */
  #maxExtraThreads;

  /**
   * The data fields for the options of extra threads to select from.
   * @type {DataField[]}
   */
  #optionsDataFields = [];

  /**
   * The number of extra threads that have been chosen.
   * @type {number}
   */
  get #numSelectedThreads() {
    return this._data.extraThreads.length;
  }

  // endregion

  constructor( { spell, caster, ...options } ) {
    super( options );

    this.#spell = spell;
    this.#caster = caster;
    this.#discipline = this.#caster.getDisciplineForSpellcastingType( this.#spell.system.spellcastingType );
    this.#maxExtraThreads = this.#getMaxExtraThreads();
    this.#optionsDataFields = this.#createOptionsDataFields();

    this._data.extraThreads = [];
  }

  /**
   * Creates new data fields to be used for form inputs. They represent the options of
   * extra threads that can be selected.
   * @returns {DataField[]} An array of data fields representing the options for extra threads.
   */
  #createOptionsDataFields() {
    const fields = foundry.data.fields;

    const choices = Object.fromEntries(
      this.#spell.system.extraThreads.map( ( ( enhancement, index ) => [
        index,
        enhancement.summaryString,
      ] )
      ) );

    const options = [];
    for ( let i = 1; i <= this.#maxExtraThreads; i++ ) {
      const optionField = new fields.StringField(
        {
          // don't need a label here, as we expect to only use it as form input
          required: true,
          nullable: true,
          initial:  null,
          blank:    false,
          trim:     true,
          choices:  choices,
        }, {
          name:     `extraThreads.${i - 1}`,
        } );
      options.push( optionField );
    }

    return options;
  }

  /**
   * Gets the maximum number of extra threads that can be selected. This is based
   * on the caster's circle in the discipline of the spell being cast.
   * @returns {number} The maximum number of extra threads that can be selected.
   */
  #getMaxExtraThreads() {
    return ED4E.extraThreadsByCircle[ this.#discipline?.system?.level || 0 ] || 0;
  }

  // region Rendering

  /** @inheritdoc */
  async _preparePartContext( partId, context, options ) {
    const newContext = await super._preparePartContext( partId, context, options );

    switch ( partId ) {
      case "main": {
        newContext.spell = this.#spell;
        newContext.caster = this.#caster;
        newContext.discipline = this.#discipline;
        newContext.maxExtraThreads = this.#maxExtraThreads;
        newContext.numSelected = this.#numSelectedThreads;
        newContext.optionFields = this.#optionsDataFields;
        break;
      }
      case "footer": {
        newContext.buttons = [
          this.constructor.BUTTONS.continue,
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

  // region Form Handling

  /** @inheritdoc */
  _processSubmitData( event, form, formData, submitOptions ) {
    const { extraThreads } = super._processSubmitData( event, form, formData, submitOptions );
    return {
      extraThreads: Object.values( extraThreads ).filter( e => !!e ).map( index => Number( index ) ),
    };
  }

  // endregion

  // region Event Handlers

  /** @inheritdoc */
  static async _continue( event, target ) {
    this.submit();
    this.resolve?.(
      this.data.extraThreads.map( index => this.#spell.system.extraThreads[ index ] )
    );
    return this.close();
  }

  // endregion
}