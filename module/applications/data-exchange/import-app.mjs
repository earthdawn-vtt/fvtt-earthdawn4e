import ApplicationEd from "../api/application.mjs";
import ImportAppData from "../../data/other/import-app.mjs";

export default class ImportApp extends ApplicationEd {

  /** @type {ImportAppData} */
  _data = null;

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    actions: {
      continue: ImportApp._continue,
    },
    form: {
      handler:        ImportApp.#onFormSubmission,
      submitOnChange: true,
    },
    position: {
      width:  600,
    },
  };

  /** @inheritdoc */
  static PARTS = {
    form:   {
      template: "systems/ed4e/templates/data-exchange/import-form.hbs",
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
    },
  };

  constructor( options ) {
    super( options );
    this._data = options.data ?? new ImportAppData();
  }

  // region Form Handling

  /**
   * Handle form submission.
   * @this {ImportApp}
   * @param {Event} event                  The submit event.
   * @param {HTMLFormElement} form         The form element.
   * @param {FormDataExtended} formData     The form data.
   * @param {object} submitOptions         The submit options.
   */
  static async #onFormSubmission( event, form, formData, submitOptions ) {
    this._data.updateSource(
      this._processSubmitData( event, form, formData, submitOptions )
    );
    if ( this.options.form.submitOnChange ) this.render();
  }

  // endregion

  // region Rendering

  /** @inheritdoc */
  async _prepareContext( options ) {
    const context = await super._prepareContext( options );

    context.folderFields = this._data.schema.fields.folder.fields;
    context.actorFields = this._data.schema.fields.actor.fields;
    context.itemFields  = this._data.schema.fields.item.fields;

    context.folderFilePickerElement = this.createFolderFilePickerElement();

    context.buttons = this.constructor.BUTTONS;

    return context;
  }

  createFolderFilePickerElement() {
    return foundry.applications.elements.HTMLFilePickerElement.create( {
      name:        "folder.path",
      noupload:    false,
      placeholder: "path/to/file.ext",
      type:        "folder",
      value:       this.data.folder.path,
    } );
  }

  // endregion

  static async _continue( event, target ) {
    this.submit();

    const filePaths = Object.entries(
      this.data
    ).map(
      ( [ key, value ] ) => value.path
    );
    const jsonData = [];
    for ( const filePath of filePaths ) {
      if ( filePath?.endsWith?.( ".json" ) ) {
        const responseJson = await fetch( filePath ).then( response => response.json() );
        jsonData.push( responseJson );
      }
    }

    this.resolve?.( jsonData );
    return this.close();
  }
}