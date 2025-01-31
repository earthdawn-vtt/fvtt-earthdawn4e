import PcData from "../../data/actor/pc.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Derivate of Foundry's Item.createDialog() functionality.
 */
export default class DocumentCreateDialog extends HandlebarsApplicationMixin( ApplicationV2 ) {

  /** @inheritDoc */
  constructor( data = {}, { resolve, documentCls, pack = null, parent = null, options = {}, } = {} ) {
    const documentType = documentCls.name;
    const documentTypeLocalized = game.i18n.localize( `DOCUMENT.${documentType}` );
    const classes = options.classes || [];
    classes.push( `create-${documentType.toLowerCase()}` );
    const window = options.window || {};
    window.title ??= game.i18n.format( "DOCUMENT.Create", { type: documentTypeLocalized } );

    foundry.utils.mergeObject(
      options,
      {
        classes,
        window,
      },
    );

    super( options );

    this.resolve = resolve;
    this.documentCls = documentCls;
    this.documentType = documentType;
    this.pack = pack;
    this.parent = parent;
    this.documentTypeLocalized = documentTypeLocalized;



    this._updateCreationData( data );
  }

  static DEFAULT_OPTIONS = {
    id:             "document-create-dialog",
    classes:        [ "earthdawn4e", "create-document" ],
    tag:            "form",
    window:  {
      frame:          true,
      resizable:      true,
      height:         900,
      width:          800,
    },
    form: {
      handler:        this.#onFormSubmission,
      submitOnChange: true,
      submitOnClose:  false,
      closeOnSubmit:  false,
    },
    position: {
      width: 1000,
      top:   100,
      left:  100,
    },
    actions: {
      createDocument: this._createDocument,
    },
  };

  static PARTS = {
    form:   {
      template:   "systems/ed4e/templates/global/document-creation.hbs",
      id:         "-document-selection",
      scrollable: [ "type-selection" ],
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
      id:       "-footer",
      classes:  [ "flexrow" ],
    },
  };

  /**
   * Wait for dialog to be resolved.
   * @param {object} [data] Initial data to pass to the constructor.
   * @param {object} [options] Options to pass to the constructor.
   * @returns {Promise<Item|null>} Created item or null.
   */
  static waitPrompt( data, options = {} ) {
    return new Promise( ( resolve ) => {
      options.resolve = resolve;
      new this( data, options ).render( { force: true, focus: true } );
    } );
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  createData = {};

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  async _prepareContext( options = {} ) {
    const folders = this.parent ? [] : game.folders.filter( ( f ) => f.type === this.documentType && f.displayed );
    // add compendium folders
    game.packs.filter(
      ( pack ) => pack.metadata.type === this.documentType
    ).forEach(
      ( pack ) => folders.push( ...pack.folders )
    );

    const types = CONFIG.ED4E.typeGroups[this.documentType];
    const typesRadio = Object.fromEntries(
      Object.entries( types ).map( ( [ k, v ], i ) => {
        return [ k, v.reduce( ( a, v ) => ( { ...a, [v]: v } ), {} ) ];
      } ),
    );

    const createData = this.createData;

    const buttons = [
      {
        type:     "button",
        label:    game.i18n.format( "DOCUMENT.Create", { type: this.documentTypeLocalized } ),
        cssClass: "finish",
        action:   "createDocument",
      },
    ];

    return {
      documentTypeLocalized: this.documentTypeLocalized,
      folders,
      name:                  createData.name,
      defaultName:           this.documentCls.implementation.defaultName( { type: createData.type } ),
      folder:                createData.folder,
      hasFolders:            folders.length > 0,
      currentType:           createData.type,
      types,
      typesRadio,
      buttons,
    };
  }

  /* -------------------------------------------- */
  /*  Form Handling                               */
  /* -------------------------------------------- */

  static async #onFormSubmission( event, form, formData ) {
    const data = foundry.utils.expandObject( formData.object );

    this._updateCreationData( data );

    this.render();
  }

  _updateCreationData( data = {} ) {
    // Fill in default type if missing
    data.type ||= CONFIG[this.documentType].defaultType || game.documentTypes[this.documentType][1];

    foundry.utils.mergeObject(
      this.createData,
      data,
      {
        inplace: true,
      }
    );
    this.createData.system ??= {};

    // Clean up data
    // if ( !data.folder && !this.createData.folder ) delete this.createData.folder;

    return this.createData;
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /** @inheritDoc */
  _onRender( context, options ) {
    this.element.querySelectorAll( ".type-selection label" ).forEach(
      element => element.addEventListener(
        "dblclick",
        this.constructor._createDocument.bind( this )
      )
    );
  }

  /**
   * Create the document.
   * @this {DocumentCreateDialog}
   * @param {Event} event The originating click event.
   * @returns {Promise<Item|null>} Created item or null.
   */
  static async _createDocument( event ) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    /* eslint-disable new-cap */
    let createData = this._updateCreationData( this.createData );
    createData.name ||= this.documentCls.implementation.defaultName( { type: createData.type } );
    createData = new this.documentCls.implementation( createData ).toObject();
    /* eslint-enable new-cap */

    let promise;

    if ( createData.type === "character"
      && game.settings.get( "ed4e", "autoOpenCharGen" )
    ) {
      promise = PcData.characterGeneration();
    } else {
      const options = {};
      if ( this.pack ) options.pack = this.pack;
      if ( this.parent ) options.parent = this.parent;
      options.renderSheet = true;

      promise = this.documentCls.implementation.create( createData, options );
    }

    this.resolve?.( promise );
    return this.close();
  }

  close( options = {} ) {
    this.resolve?.( null );
    return super.close( options );
  }

}