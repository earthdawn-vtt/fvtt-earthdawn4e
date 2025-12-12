const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;


/**
 * @typedef {object} ApplicationButtonFoundry
 * @property {string} type The type of button.
 * @property {string} name The name that will be applied to the button element's `name` attribute.
 * @property {string} cssClass The CSS class to apply to the button.
 * @property {string} action The action to perform when the button is clicked, as defined in {@link ApplicationV2#DEFAULT_OPTIONS}`.
 * @property {boolean} disabled Whether the button is disabled and add the `disabled` attribute to the button.
 * @property {string} icon The icon to display on the button. Must be a valid Font Awesome icon class.
 * @property {string} label The label to display on the button. Will be localized.
 */


/**
 * A stock application meant for async behavior using templates.
 * @augments ApplicationV2
 * @mixes HandlebarsApplicationMixin
 */
export default class ApplicationEd extends HandlebarsApplicationMixin( ApplicationV2 ) {

  // region Static Properties

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: [ "ed4e" ],
    tag:     "form",
    form:    {
      handler:        ApplicationEd.#onFormSubmission,
      submitOnChange: false,
      closeOnSubmit:  false,
    },
    actions: {
      cancel:   ApplicationEd._cancel,
      continue: ApplicationEd._continue,
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

  /**
   *
   * @type {{[action: string]: ApplicationButtonFoundry}}
   */
  static BUTTONS = {
    cancel: {
      type:     "button",
      action:   "cancel",
      cssClass: "cancel",
      icon:     "fas fa-times",
      label:    "ED.Dialogs.Buttons.cancel",
    },
    continue: {
      type:     "button",
      action:   "continue",
      cssClass: "continue",
      icon:     "fa-solid fa-check",
      label:    "ED.Dialogs.Buttons.continue",
    },
  };

  // endregion

  // region Static Methods

  /**
   * Factory method for asynchronous behavior. Displays this application and waits for user input.
   * @param {object} options  Options to configure the prompt.
   * @returns {Promise<*>}  A promise whose resolution depends on the specific implementation of the prompt.
   *                            Defaults to the `undefined`.
   */
  static async waitPrompt( options = {} ) {
    return new Promise( ( resolve ) => {
      options.resolve = resolve;
      new this( options ).render(
        {
          force: true,
        },
      );
    } );
  }

  // endregion

  // region Properties

  /**
   * Stored form data.
   * @type {object|null}
   */
  _data = null;

  // endregion

  // region Getter

  /**
   * Stored form data.
   * @type {object|null}
   */
  get data() {
    return this._data;
  }

  /**
   * Whether to re-render the part named "footer" on each render.
   * @type {boolean}
   */
  get _reRenderFooter() {
    return false;
  }

  // endregion

  constructor( options ) {
    super( options );
    this.resolve = options.resolve;
    this._data = options.data ?? {};
  }

  // region Event Handlers

  /**
   * A basic handler for the cancel action. This is meant to be overridden by subclasses.
   * In this case, it simply closes the application.
   * @type {ApplicationClickAction}
   */
  static async _cancel( event, target ) {
    this.resolve?.( undefined );
    return this.close();
  }

  /**
   * A basic handler for the continue action. This should be overridden by subclasses.
   * In this case, it resolves the promise with the current data and closes the application.
   * @type {ApplicationClickAction}
   */
  static async _continue( event, target ) {
    this.submit();
    this.resolve?.( this.data );
    return this.close();
  }

  // endregion

  // region Form Handling

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
    if ( this.options.form.submitOnChange ) this.render();
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
  _configureRenderOptions( options ) {
    super._configureRenderOptions( options );

    if ( !options.isFirstRender
      && !this._reRenderFooter
      && Array.isArray( options.parts )
    ) options.parts = options.parts.filter( part => part !== "footer" );
  }
  
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