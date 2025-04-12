import ED4E from "../../config/_module.mjs";
import { getSetting } from "../../settings.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/**
 * Extend the basic ActorSheet with modifications
 * @augments {ActorSheetV2}
 * @mixes HandlebarsApplicationMixin
 */
export default class ActorSheetEd extends HandlebarsApplicationMixin( ActorSheetV2 ) {

  /** @inheritdoc */
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
      editImage:          ActorSheetEd._onEditImage,
      editItem:           ActorSheetEd._onItemEdit,
      deleteItem:         ActorSheetEd._onItemDelete,
      displayItem:        ActorSheetEd._onDisplayItem,
      expandItem:         ActorSheetEd._onCardExpand,
      createChild:        ActorSheetEd._onCreateChild,
      deleteChild:        ActorSheetEd._onDeleteChild,
      displayChildToChat: ActorSheetEd._onDisplayChildToChat,
      editChild:          ActorSheetEd._onEditChild,
    },
    form: {
      submitOnChange: true,
    },
  };

  /** @inheritdoc */
  static TABS = {
    sheet: {
      tabs:        [],
      initial:     "general",
      labelPrefix: "ED.Sheet.Tabs",
    },
  };

  static TAB_ORDER_SHEET = [
    "general",
    "talents",
    "powers",
    "skills",
    "devotions",
    "spells",
    "equipment",
    "description",
    "notes",
    "reputation",
    "specials",
    "legend",
    "configuration",
    "classes",
  ];

  static addSheetTabs( tabs ) {
    this.TABS = foundry.utils.deepClone( this.TABS );
    this.TABS.sheet.tabs.push( ...tabs );
    this.TABS.sheet.tabs.sort(
      ( a, b ) => this.TAB_ORDER_SHEET.indexOf( a.id ) - this.TAB_ORDER_SHEET.indexOf( b.id )
    );
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @inheritdoc */
  async _prepareContext( options ) {
    // TODO: überprüfen was davon benötigt wird
    const context = await super._prepareContext( options );
    foundry.utils.mergeObject( context, {
      actor:                  this.document,
      system:                 this.document.system,
      items:                  this.document.items,
      options:                this.options,
      systemFields:           this.document.system.schema.fields,
      config:                 ED4E,
    } );

    context.enrichedDescription = await TextEditor.enrichHTML(
      this.document.system.description.value,
      {
        // Only show secret blocks to owner
        secrets:    this.document.isOwner,
      }
    );

    return context;
  }

  /** @inheritdoc */
  async _renderHTML( context, options ) {
    return super._renderHTML( context, options );
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
    if ( getSetting( "quickDeleteEmbeddedOnShiftClick" ) && event.shiftKey ) return item.delete();
    else item.deleteDialog();
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

  /** @inheritDoc */
  static async _onCreateChild( event, target ) {
    const type = target.dataset.type;

    if ( type === "effect" ) return ActiveEffect.implementation.create( {
      type:     "eae",
      name:     game.i18n.localize( "ED.ActiveEffect.newEffectName" ),
      icon:     "icons/svg/aura.svg",
      changes:  [ {} ],
      system:  {
        duration: {
          type: target.dataset.effectPermanent ? "permanent" : "combat",
        },
        changes: [ {} ],
      },
    }, {
      parent:      this.document,
      renderSheet: true,
    } );

    // this will make more sense when we have a common documentSheet mixin
    /* if ( activeTab === "spells" ) return Item.implementation.create({
      name: game.i18n.format("DOCUMENT.New", { type: game.i18n.format(CONFIG.Item.typeLabels.spell) }),
      type: "spell",
      img: Item.implementation.getDefaultArtwork({ type: "spell" })?.img ?? Item.implementation.DEFAULT_ICON
    }, { parent: this.actor, renderSheet: true });

    const features = ["feat", "race", "background", "class", "subclass"];
    if ( this.actor.type === "npc" ) features.push("weapon");

    let types = {
      features,
      inventory: ["weapon", "equipment", "consumable", "tool", "container", "loot"]
    }[activeTab] ?? [];

    types = types.filter(type => {
      const model = CONFIG.Item.dataModels[type];
      return !model.metadata?.singleton || !this.actor.itemTypes[type].length;
    });

    if ( types.length ) return Item.implementation.createDialog({}, {
      parent: this.actor, pack: this.actor.pack, types
    }); */
  }

  /** @inheritDoc */
  static async _onDeleteChild( event, target ) {
    const document = await fromUuid( target.dataset.uuid );
    if ( getSetting( "quickDeleteEmbeddedOnShiftClick" ) && event.shiftKey ) return document.delete();
    else document.deleteDialog();
  }

  /** @inheritDoc */
  static async _onDisplayChildToChat( event, target ) {
    ChatMessage.create( { content: "Coming up: a beautiful description of the Item you just clicked to be displayed here in chat!" } );
  }

  /** @inheritDoc */
  static async _onEditChild( event, target ) {
    ( await fromUuid( target.dataset.uuid ) ).sheet?.render( { force: true } );
  }

}
