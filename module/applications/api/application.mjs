const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;


/**
 * A stock application meant for async behavior using templates.
 * @augments ApplicationV2
 * @mixes HandlebarsApplicationMixin
 */
export default class ApplicationEd extends HandlebarsApplicationMixin( ApplicationV2 ) {

  // region Properties

  /**
   * Stored form data.
   * @type {object|null}
   */
  _data = null;

  /**
   * Stored form data.
   * @type {object|null}
   */
  get data() {
    return this._data;
  }

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: [ "ed4e" ],
    tag:     "form",
    form:    {
      handler:       ApplicationEd.#onFormSubmission,
      closeOnSubmit: false,
    },
    position: {
      width:  400,
      height: "auto",
    },
    window: {
      frame:          true,
      contentClasses: [ "standard-form" ],
    },
  };

  // endregion

  /**
   * Factory method for asynchronous behavior.
   * @param {object} options              Application rendering options.
   * @returns {Promise<object|null>}      A promise that resolves to the form data.
   */
  static async create( options ) {
    const { promise, resolve } = Promise.withResolvers();
    const application = new this( options );
    application.addEventListener( "close", () => resolve( application.data ), { once: true } );
    application.render( { force: true } );
    return promise;
  }

  // region Event Handlers

  /**
   * Handle form submission.
   * @this {ApplicationEd}
   * @param {Event} event                  The submit event.
   * @param {HTMLFormElement} form         The form element.
   * @param {FormDataExtended} formData     The form data.
   * @param {object} submitOptions         The submit options.
   */
  static async #onFormSubmission( event, form, formData, submitOptions ) {
    this._data = this._processSubmitData( event, form, formData, submitOptions );
  }

  /**
   * Perform processing of the submitted data. To prevent submission, throw an error.
   * @param {Event}event                  The submit event.
   * @param {HTMLFormElement} form        The form element.
   * @param {FormDataExtended} formData   The form data.
   * @param {object} submitOptions        The submit options.
   * @returns {object}                     The data to return from this application.
   */
  _processSubmitData ( event, form, formData, submitOptions ) {
    return foundry.utils.expandObject( formData.object );
  }

  // endregion

  // region Rendering

  /** @inheritDoc */
  async _prepareContext( options ) {
    const context = await super._prepareContext( options );
    context.data = this._data;

    return context;
  }

  /** @inheritDoc */
  async _renderHTML( context, options ) {
    return super._renderHTML( context, options );
  }

  // endregion
}