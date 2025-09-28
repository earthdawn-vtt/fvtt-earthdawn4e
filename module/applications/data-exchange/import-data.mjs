import ApplicationEd from "../api/application.mjs";
import { SYSTEM } from "../../config/_module.mjs";
import EdImporter from "../../services/data-exchange/imports/importer.mjs";

export default class ImportDataApp extends ApplicationEd {

  // region Static Properties

  static DEFAULT_OPTIONS = {
    actions: {
      import: ImportDataApp._import,
    },
  };

  static PARTS = {
    form: {
      template: "systems/ed4e/templates/data-exchange/import-data.hbs",
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
    }
  };

  // endregion

  /**
   * @inheritdoc
   * @param {object} options Application options
   * @param {object} options.importerOptions Options to pass to the importer instance
   * created from the file selection dialog.
   */
  constructor( options ) {
    super( options );
    this.options.window.title = game.i18n.localize( "DOCUMENT.ImportData" );
    this.importerOptions = options.importerOptions ?? {};
  }

  // region Event Handlers

  /** @type {ApplicationClickAction} */
  static async _import( event, button ) {
    const form = this.form;
    if ( !form.data.files.length ) {
      return ui.notifications.error( "DOCUMENT.ImportDataError", {localize: true} );
    }
    this.resolve?.( new EdImporter( form.data.files, this.importerOptions ) );
    return this.close();
  }

  // endregion

  // region Rendering

  /** @inheritDoc */
  async _prepareContext( options ) {
    const context = await super._prepareContext( options );

    context.hint1 = game.i18n.localize( "ED.Dialogs.ImportDocument.importDataHint1" );
    context.hint2 = game.i18n.localize( "ED.Dialogs.ImportDocument.importDataHint2" );

    context.buttons = [ {
      action:   "import",
      label:    game.i18n.localize( "ED.Dialogs.Buttons.import" ),
      icon:     `fa-solid ${ SYSTEM.icons.import }`,
      default:  true,
    }, {
      action: "no",
      label:  game.i18n.localize( "ED.Dialogs.Buttons.cancel" ),
      icon:   `fa-solid ${ SYSTEM.icons.cancel }`,
    } ];
    return context;
  }

  // endregion

}