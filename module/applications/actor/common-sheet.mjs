import ED4E from "../../config.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/**
 * Extend the basic ActorSheet with modifications
 * @augments {ActorSheetV2}
 */

export default class ActorSheetEd extends HandlebarsApplicationMixin( ActorSheetV2 ) {

  constructor( options = {} ) {
    super( options );
  }

  /** 
   * @override 
   */
  static DEFAULT_OPTIONS = {
    classes:  [ "earthdawn4e", "sheet", "actor" ],
    window:   {
      frame:          true,
      positioned:     true,
      icon:           false,
      minimizable:    true,
      resizable:      true,
    },
    actions:  {
      editImage:        ActorSheetEd._onEditImage,
      editItem:         ActorSheetEd._onItemEdit,
      deleteItem:       ActorSheetEd._onItemDelete,
      displayItem:      ActorSheetEd._onDisplayItem,
      editEffect:       ActorSheetEd._onEffectEdit,
      deleteEffect:     ActorSheetEd._onEffectDelete,
      addEffect:        ActorSheetEd._onEffectAdd,
      expandItem:       ActorSheetEd._onCardExpand, 
    },
    form: {
      submitOnChange: true,
    },
  };

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  async _prepareContext() {
    // TODO: überprüfen was davon benötigt wird
    const context = {
      actor:                  this.document,
      system:                 this.document.system,
      items:                  this.document.items,
      options:                this.options,
      systemFields:           this.document.system.schema.fields,
      // enrichment:             await this.document._enableHTMLEnrichment(),
      // enrichmentEmbededItems: await this.document._enableHTMLEnrichmentEmbeddedItems(),
      config:                 ED4E,
    };

    context.enrichedDescription = await TextEditor.enrichHTML(
      this.document.system.description.value,
      {
        // Only show secret blocks to owner
        secrets:    this.document.isOwner,
      }
    );

    return context;
  }

  /* -------------------------------------------- */
  /*  Drag and Drop                               */
  /* -------------------------------------------- */

  /* -------------------------------------------- */
  /*  Event Handlers                              */
  /* -------------------------------------------- */

  static async _onEditImage( event, target ) {
    const attr = target.dataset.edit;
    const current = foundry.utils.getProperty( this.document, attr );
    const { img } = this.document.constructor.getDefaultArtwork?.( this.document.toObject() ) ?? {};
    // eslint-disable-next-line no-undef
    const fp = new FilePicker( {
      current,
      type:           "image",
      redirectToRoot: img ? [ img ] : [],
      callback:       ( path ) => {
        this.document.update( { [attr]: path } );
      },
      top:  this.position.top + 40,
      left: this.position.left + 10,
    } );
    return fp.browse();
  }

  static async _onItemEdit( event, target ) {
    event.preventDefault();
    const itemId = target.parentElement.dataset.itemId;
    const item = this.document.items.get( itemId );
    return item.sheet?.render( true );
  }

  static async _onItemDelete( event, target ) {
    event.preventDefault();
    const itemId = target.parentElement.dataset.itemId;
    const item = this.document.items.get( itemId );
    if ( !item ) return;
    return item.deleteDialog();
  }

  static async _onEffectEdit( event, target ) {
    ui.notifications.info( "Effects not done yet" );
  }

  static async _onEffectDelete( event, target ) {
    ui.notifications.info( "Effects not done yet" );
  }

  static async _onEffectAdd( event, target ) {
    ui.notifications.info( "Effects not done yet" );
  }

  static async _onCardExpand( event, target ) {
    event.preventDefault();

    const itemDescription = $( target )
      .parent( ".item-id" )
      .parent( ".card__ability" )
      .children( ".card__description" );

    itemDescription.toggleClass( "card__description--toggle" );
  }

  static async _onDisplayItem( event, target ) {
    ui.notifications.info( "Display Item not done yet" );
  }
}
