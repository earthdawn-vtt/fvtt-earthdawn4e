const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;


/**
 * A stock application meant for async behavior using templates.
 * @augments ApplicationV2
 * @mixes HandlebarsApplicationMixin
 */
export default class Application extends HandlebarsApplicationMixin( ApplicationV2 ) {

  // region Properties

  /**
   * Stored form data.
   * @type {object|null}
   */
  #config = null;

  /**
   * Stored form data.
   * @type {object|null}
   */
  get config() {
    return this.#config;
  }

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: [ "ed4e" ],
    form:    {
      handler:       Application.#onFormSubmission,
      closeOnSubmit: false,
    },
    position: {
      width:  400,
      height: "auto",
    },
    tag:    "form",
    window: {
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
    application.addEventListener( "close", () => resolve( application.config ), { once: true } );
    application.render( { force: true } );
    return promise;
  }

  /**
   * Handle form submission.
   * @this {Application}
   * @param {Event} event                  The submit event.
   * @param {HTMLFormElement} form         The form element.
   * @param {FormDataExtended} formData     The form data.
   * @param {object} submitOptions         The submit options.
   */
  static #onFormSubmission( event, form, formData, submitOptions ) {
    this.#config = this.processSubmitData( event, form, formData, submitOptions );
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

  /**
   * @inheritDoc
   */
  async _renderHTML( context, options ) {
    return super._renderHTML( context, options );
  }
}