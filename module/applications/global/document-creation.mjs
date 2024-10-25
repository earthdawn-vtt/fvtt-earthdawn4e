import PcData from "../../data/actor/pc.mjs";

/**
 * Derivate of Foundry's Item.createDialog() functionality.
 */
export default class DocumentCreateDialog extends FormApplication {
  /** @inheritDoc */
  constructor( data = {}, { resolve, documentCls, pack = null, parent = null, options = {} } = {} ) {
    super( data, options );

    this.resolve = resolve;
    this.documentCls = documentCls;
    this.documentType = documentCls.name;
    this.pack = pack;
    this.parent = parent;
    this.documentTypeLocalized = game.i18n.localize( `DOCUMENT.${this.documentType}` );
    // since after super we are sure that default options already set the `classes` property
    this.options.classes.push( `create-${this.documentType.toLowerCase()}` );

    this._updateCreationData( data );
  }

  documentTypeLocalized;

  get title() {
    return game.i18n.format( "DOCUMENT.Create", { type: this.documentTypeLocalized } );
  }

  get template() {
    return "systems/ed4e/templates/global/document-creation.hbs";
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      closeOnSubmit:  false,
      submitOnChange: true,
      submitOnClose:  false,
      height:         900,
      width:          800,
      resizable:      true,
      classes:        [ ...options.classes, "earthdawn4e", "create-document" ],
    };
  }

  get initialData() {
    return this.object;
  }

  /** @type {object} */
  createData = {};

  getData( options = {} ) {
    const folders = this.parent ? [] : game.folders.filter( ( f ) => f.type === this.documentType && f.displayed );
    const compendiumPacks  = game.packs;
    let compendiumFolders = [];
    for ( const pack of compendiumPacks ) {
      if ( pack.metadata.type !== this.documentType ) continue;
      const folder = pack.folders;
      compendiumFolders.push( folder );
    }
    for ( const folder of compendiumFolders ) {
      folders.push( ...folder );
    }
    
    const types = CONFIG.ED4E.typeGroups[this.documentType];
    const typesRadio = Object.fromEntries(
      Object.entries( types ).map( ( [ k, v ], i ) => {
        return [ k, v.reduce( ( a, v ) => ( { ...a, [v]: v } ), {} ) ];
      } ),
    );

    const createData = this.createData;

    return {
      documentTypeLocalized: this.documentTypeLocalized,
      folders,
      name:                  createData.name,
      defaultName:           this.documentCls.implementation.defaultName(),
      folder:                createData.folder,
      hasFolders:            folders.length > 0,
      currentType:           createData.type,
      types,
      typesRadio,
    };
  }

  /**
   * @param {jQuery} jq jQuery HTML instance
   */
  activateListeners( jq ) {
    super.activateListeners( jq );

    $( this.form.querySelector( "button.create-document" ) ).on( "click", this._createDocument.bind( this ) );
    $( this.form.querySelectorAll( ".type-selection label" ) ).on( "dblclick", this._createDocument.bind( this ) );
  }

  _updateObject( event, formData ) {
    const data = foundry.utils.expandObject( formData );

    this._updateCreationData( data );

    this.render();
  }

  _updateCreationData( data = {} ) {
    // Fill in default type if missing
    data.type ||= CONFIG[this.documentType].defaultType || game.documentTypes[this.documentType][1];

    this.createData = foundry.utils.mergeObject( this.initialData, data, { inplace: false } );
    this.createData.system ??= {};

    // Clean up data
    if ( !data.folder && !this.initialData.folder ) delete this.createData.folder;

    return this.createData;
  }

  /**
   * Create the document.
   * @param {Event} event The originating click event.
   * @returns {Promise<Item|null>} Created item or null.
   */
  async _createDocument( event ) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    await this.submit( { preventRender: true } );

    /* eslint-disable new-cap */
    let createData = this._updateCreationData( this.createData );
    createData.name ||= this.documentCls.implementation.defaultName();
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

  /**
   * Wait for dialog to the resolved.
   * @param {object} [data] Initial data to pass to the constructor.
   * @param {object} [options] Options to pass to the constructor.
   * @returns {Promise<Item|null>} Created item or null.
   */
  static waitPrompt( data, options = {} ) {
    return new Promise( ( resolve ) => {
      options.resolve = resolve;
      new this( data, options ).render( true, { focus: true } );
    } );
  }
}