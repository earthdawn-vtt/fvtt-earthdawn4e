import ED4E from "../../config.mjs";

const { DocumentSheetV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Extend the basic ActorSheet with modifications
 * @augments {ActorSheet}
 */
export default class ActorSheetEd extends HandlebarsApplicationMixin( DocumentSheetV2 ) {

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
    form: {
      submitOnChange: true,
      closeOnSubmit:  true,
    },
    actions:  {
      editImage:    this._onEditImage,
      editItem:     this._onItemEdit,
      deleteItem:   this._onItemDelete,
      editEffect:   this._onEffectEdit,
      deleteEffect: this._onEffectDelete,
      addEffect:    this._onEffectAdd,
      expandItem:   this._onCardExpand,
    },
  };

  async _prepareContext() {
    // TODO: überprüfen was davon benötigt wird
    const context = {
      actor:                  this.document,
      system:                 this.document.system,
      items:                  this.document.items,
      options:                this.options,
      systemFields:           this.document.system.schema.fields,
      // enrichment:             await this.actor._enableHTMLEnrichment(),
      // enrichmentEmbededItems: await this.actor._enableHTMLEnrichmentEmbeddedItems(),
      config:                 ED4E,
      splitTalents:           game.settings.get( "ed4e", "talentsSplit" ),
    };
    return context;
  }

  // region TODOS
  // die actions umsetzten
  // drag and drop einbauen
  // enrichments oben in prepareContext einbauen



  // /* -------------------------------------------- */
  // /*                   Effects                    */
  // /* -------------------------------------------- */

  // /**
  //  * Handle creating an owned ActiveEffect for the Actor.
  //  * @param {Event} event     The originating click event.
  //  * @returns {Promise|null}  Promise that resolves when the changes are complete.
  //  * @private
  //  */
  // _onEffectAdd( event ) {
  //   event.preventDefault();
  //   return this.actor.createEmbeddedDocuments( "ActiveEffect", [ {
  //     label:    "New Effect",
  //     icon:     "icons/svg/item-bag.svg",
  //     duration: { rounds: 1 },
  //     origin:   this.actor.uuid
  //   } ] );
  // }

  // /**
  //  * Handle deleting an existing Owned ActiveEffect for the Actor.
  //  * @param {Event} event                       The originating click event.
  //  * @returns {Promise<ActiveEffect>|undefined} The deleted item if something was deleted.
  //  * @private
  //  */
  // _onEffectDelete( event ) {
  //   event.preventDefault();
  //   const itemId = event.currentTarget.parentElement.dataset.itemId;
  //   const effect = this.actor.effects.get( itemId );
  //   if ( !effect ) return;
  //   return effect.deleteDialog();
  // }

  // /**
  //  * Handle editing an existing Owned ActiveEffect for the Actor.
  //  * @param {Event}event    The originating click event.
  //  * @returns {any}         The rendered item sheet.
  //  * @private
  //  */

  // _onEffectEdit( event ) {
  //   event.preventDefault();
  //   const itemId = event.currentTarget.parentElement.dataset.itemId;
  //   const effect = this.actor.effects.get( itemId );
  //   return effect.sheet?.render( true );
  // }

}
