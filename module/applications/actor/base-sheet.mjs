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
      handler:        ActorSheetEd.#onFormSubmission,
      submitOnChange: true,
    },
    actions:  {
      editImage:        ActorSheetEd._onEditImage,
      editItem:         ActorSheetEd._onItemEdit,
      deleteItem:       ActorSheetEd._onItemDelete,
      editEffect:       ActorSheetEd._onEffectEdit,
      deleteEffect:     ActorSheetEd._onEffectDelete,
      addEffect:        ActorSheetEd._onEffectAdd,
      expandItem:       ActorSheetEd._onCardExpand,
      displayItem:      ActorSheetEd._onDisplayItem,
      takeDamage:       ActorSheetEd.takeDamage,
      knockDown:        ActorSheetEd.knockdownTest,
      recovery:         ActorSheetEd.rollRecovery,
      jumpUp:           ActorSheetEd.jumpUp,
      initiative:       ActorSheetEd.rollInitiative,
      rollable:         ActorSheetEd.rollable,
      changeItemStatus: ActorSheetEd.changeItemStatus,
    },
  };

  static async #onFormSubmission( event, form, formData ) {
    const data = foundry.utils.expandObject( formData.object );
    console.log( "onFormSubmission", data );
  }

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
      splitTalents:           game.settings.get( "ed4e", "talentsSplit" ),
    };


    context.enrichedDescription = await TextEditor.enrichHTML(
      this.document.system.description.value,
      {
        // Only show secret blocks to owner
        secrets:    this.document.isOwner,
        EdRollData: this.document.getRollData
      }
    );

    return context;
  }

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

  static async takeDamage( event, target ) {
    const takeDamage = await this.document.getPrompt( "takeDamage" );
    if ( !takeDamage || takeDamage === "close" ) return;

    this.document.takeDamage(
      takeDamage.damage,
      false,
      takeDamage.damageType,
      takeDamage.armorType,
      takeDamage.ignoreArmor,
    );
  }

  static async knockdownTest( event, target ) {
    event.preventDefault();
    const damageTaken = 0;
    this.document.knockdownTest( damageTaken );
  }

  static async rollRecovery( event, target ) {
    event.preventDefault();
    const recoveryMode = await this.document.getPrompt( "recovery" );
    this.document.rollRecovery( recoveryMode, {event: event} );
  }

  static async jumpUp( event, target ) {
    event.preventDefault();
    this.document.jumpUp( {event: event} );
  }

  static async rollInitiative( event, target ) {
    event.preventDefault();
    ui.notifications.info( "Initiative not done yet" );
    this.document.rollInitiative( {event: event} );
  }

  static async rollable( event, target ) {
    event.preventDefault();
    const rolltype = target.dataset.rolltype;
    if ( rolltype === "attribute" ) {
      const attribute = target.dataset.attribute;
      this.document.rollAttribute( attribute, {}, { event: event } );
    } else if ( rolltype === "ability" ) {
      const li = target.closest( ".item-id" );
      const ability = this.document.items.get( li.dataset.itemId );
      this.document.rollAbility( ability, {}, { event: event } );
    } else if ( rolltype === "equipment" ) {
      const li = target.closest( ".item-id" );
      const equipment = this.document.items.get( li.dataset.itemId );
      this.document.rollEquipment( equipment, { event: event } );
    }
  }

  /**
   * Handle changing the holding type of owned items.
   * @description itemStatus.value =
   * @param target
   * 1: owned,
   * 2: carried,
   * 3: equipped,
   * 4: mainHand,
   * 5: offHand,
   * 6: twoHanded,
   * 7: tail
   * @param {Event} event     The originating click event.
   * @returns {Application}   The rendered item sheet.
   * @private
   * @userFunction              UF_PhysicalItems-onChangeItemStatus
   */
  // eslint-disable-next-line complexity
  static async changeItemStatus( event, target ) {
    event.preventDefault();

    // if left click is used, rotate the item normally
    const rotate = event.button === 0 || event.button === 2;
    // if shift+left click is used, unequip the item
    const unequip = rotate && event.shiftKey;
    // middle click is used to deposit the item
    const deposit = event.button === 1;
    // if right click is used, rotate status backwards
    const backwards = event.button === 2;

    const li = target.closest( ".item-id" );
    const item = this.document.items.get( li.dataset.itemId );

    if ( unequip ) return item.system.carry()?.then( _ => this.render() );
    if ( rotate ) return this.document.rotateItemStatus( item.id, backwards ).then( _ => this.render() );
    if ( deposit ) return item.system.deposit()?.then( _ => this.render() );
    return this;
  }




  


  /* -------------------------------------------- */


  // region TODOS
  // drag and drop einbauen
  // enrichments oben in prepareContext einbauen -- roll data & enrichment funktioniert nicht richtig
  // wechsel der tabs nicht richtig, nach #nderung kommt der general tab aber aktiv scheint noch der vorgänger...

}
