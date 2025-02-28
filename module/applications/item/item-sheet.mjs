import ED4E from "../../config/_module.mjs";
import SpellEnhancementsConfig from "../configs/spell-enhancements-config.mjs";
import ConstraintsConfig from "../configs/constraints-config.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

// noinspection JSClosureCompilerSyntax
/**
 * Extend the basic ActorSheet with modifications
 * @augments {ItemSheetV2}
 */
export default class ItemSheetEd extends HandlebarsApplicationMixin( ItemSheetV2 ) {

  // region Static Properties
  static DEFAULT_OPTIONS = {
    id:       "item-sheet-{id}",
    uniqueId: String( ++globalThis._appId ),
    classes:  [ "earthdawn4e", "sheet", "item" ],
    window:   {
      frame:          true,
      positioned:     true,
      icon:           false,
      minimizable:    true,
      resizable:      true,
    },
    form: {
      submitOnChange: true,
    },
    actions:  {
      config:             ItemSheetEd._onConfig,
      editImage:          ItemSheetEd._onEditImage,
      createChild:        ItemSheetEd._onCreateChild,
      deleteChild:        ItemSheetEd._onDeleteChild,
      displayChildToChat: ItemSheetEd._onDisplayChildToChat,
      editChild:          ItemSheetEd._onEditChild,
    },
    position: {
      top:    50,
      left:   220,
      width:  800,
      height: 800,
    }
  };

  static PARTS = {
    header: {
      template: "systems/ed4e/templates/item/item-partials/item-section-name.hbs",
      id:       "item-name",
      classes:  [ "item-name" ]
    },
    top: {
      template: "systems/ed4e/templates/item/item-partials/item-section-top.hbs",
      id:       "top",
      classes:  [ "top" ]
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
      id:       "-tabs-navigation",
      classes:  [ "tabs-navigation" ],
    },
    "general": {
      template: "systems/ed4e/templates/item/item-partials/item-description.hbs",
      classes:  [ "general" ]
    },
    "details": {
      template: "systems/ed4e/templates/item/item-partials/item-details.hbs",
      classes:  [ "details" ]
    },
    "effects": {
      template: "systems/ed4e/templates/item/item-partials/item-details/item-effects.hbs",
      classes:  [ "effects" ]
    },
  };

  /** @inheritDoc */
  static TABS = {
    sheet: {
      tabs:        [
        { id:    "general", },
        { id:    "details", },
        { id:    "effects", },
      ],
      initial:     "general",
      labelPrefix: "ED.Item.Tabs",
    },
  };
  // endregion

  tabGroups = {
    sheet:             "general",
    classAdvancements: "options",
  };

  // region Rendering
  async _preparePartContext( partId, contextInput, options ) {
    const context = await super._preparePartContext( partId, contextInput, options );
    switch ( partId ) {
      case "header":
      case "top":
      case "tabs":
        break;
      case "general":
        break;
      case "details":
        break;
      case "effects":
        break;
    }
    return context;
  }

  async _prepareContext( options ) {
    const context = await super._prepareContext( options );
    foundry.utils.mergeObject(
      context,
      {
        item:                   this.document,
        system:                 this.document.system,
        options:                this.options,
        systemFields:           this.document.system.schema.fields,
        isGM:                   game.user.isGM,
        config:                 ED4E,
      }
    );

    context.enrichedDescription = await TextEditor.enrichHTML(
      this.document.system.description.value,
      {
        // Only show secret blocks to owner
        secrets:    this.document.isOwner,
        EdRollData: this.document.getRollData
      }
    );

    context.enrichedBriefDescription = await TextEditor.enrichHTML(
      this.document.system.summary.value,
      {
        // Only show secret blocks to owner
        secrets:    this.document.isOwner,
      }
    );

    return context;
  }

  /** @inheritDoc */
  async _onRender( context, options ) {
    await super._onRender( context, options );
    if ( !game.user.isGM ) return;
    new DragDrop( {
      dragSelector: ".draggable",
      dropSelector: null,
      // permissions: { dragstart: this._canDragStart.bind(this), drop: this._canDragDrop.bind(this) },
      callbacks:    {
        dragstart: this._onDragStart.bind( this ),
        dragover:  this._onDragOver.bind( this ),
        drop:      this._onDrop.bind( this )
      }
    } ).bind( this.element );
  }
  // endregion

  // region Event Handlers
  static async _onConfig( event, target ) {
    event.preventDefault();
    event.stopPropagation();

    let app;
    switch ( target.dataset.configType ) {
      case "extraSuccess":
      case "extraThreads":
        app = new SpellEnhancementsConfig( {
          document: this.document,
          type:     target.dataset.configType,
        } );
        break;
      case "requirements":
      case "restrictions":
        app = new ConstraintsConfig( {
          document: this.document,
          type:     target.dataset.configType,
        } );
        break;
    }
    app?.render( { force: true } );
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

  /** @inheritDoc */
  static async _onCreateChild( event, target ) {
    const type = target.dataset.type;

    if ( type === "effect" ) return ActiveEffect.implementation.create( {
      type:     "eae",
      name:     game.i18n.localize( "ED.ActiveEffect.newEffectName" ),
      icon:     "icons/svg/aura.svg",
      changes:  [ {} ],
      duration: {
        permanent: !!target.dataset.effectPermanent,
      },
      system:  {
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
    ( await fromUuid( target.dataset.uuid ) ).delete();
  }

  /** @inheritDoc */
  static async _onDisplayChildToChat( event, target ) {
    ChatMessage.create( { content: "Coming up: a beautiful description of the Item you just clicked to be displayed here in chat!" } );
  }

  /** @inheritDoc */
  static async _onEditChild( event, target ) {
    ( await fromUuid( target.dataset.uuid ) ).sheet?.render( { force: true } );
  }
  // endregion

  // region Drag and Drop

  // this is taken and adjusted from Foundry's ActorSheetV2 class

  /**
   * An event that occurs when a drag workflow begins for a draggable item on the sheet.
   * @param {DragEvent} event       The initiating drag start event
   * @returns {Promise<void>}
   * @protected
   */
  async _onDragStart( event ) {
    const li = event.currentTarget;
    if ( "link" in event.target.dataset ) return;
    let dragData;

    // Active Effect
    if ( li.dataset.effectId ) {
      const effect = this.item.effects.get( li.dataset.effectId );
      dragData = effect.toDragData();
    }

    // Set data transfer
    if ( !dragData ) return;
    event.dataTransfer.setData( "text/plain", JSON.stringify( dragData ) );
  }

  /**
   * An event that occurs when a drag workflow moves over a drop target.
   * @param {DragEvent} event      The dragover event
   * @protected
   */
  _onDragOver( event ) {}

  /**
   * An event that occurs when data is dropped into a drop target.
   * @param {DragEvent} event     The drop event
   * @returns {Promise<void>}
   * @protected
   */
  async _onDrop( event ) {
    if ( !this.isEditable ) return;
    const data = TextEditor.getDragEventData( event );
    const item = this.item;
    const allowed = Hooks.call( "dropItemSheetData", item, this, data );
    if ( allowed === false ) return;

    // Dropped Documents
    const documentClass = getDocumentClass( data.type );
    if ( documentClass ) {
      const document = await documentClass.fromDropData( data );
      await this._onDropDocument( event, document );
    }
  }

  /**
   * Handle a dropped document on the ItemSheet
   * @param {DragEvent} event         The initiating drop event
   * @param {Document} document       The resolved Document class
   * @returns {Promise<void>}
   * @protected
   */
  async _onDropDocument( event, document ) {
    if ( !this.item.system._onDropDocument( event, document ) ) return;
    switch ( document.documentName ) {
      case "ActiveEffect":
        return this._onDropActiveEffect( event, /** @type { ActiveEffect } */ document );
      case "Actor":
        return this._onDropActor( event, /** @type { Actor } */ document );
      case "Item":
        return this._onDropItem( event, /** @type { Item } */ document );
      case "Folder":
        return this._onDropFolder( event, /** @type { Folder } */ document );
    }
  }

  /**
   * Handle a dropped Active Effect on the ItemSheet.
   * The default implementation creates an Active Effect embedded document on the Actor.
   * @param {DragEvent} event       The initiating drop event
   * @param {ActiveEffect} effect   The dropped ActiveEffect document
   * @returns {Promise<void>}
   * @protected
   */
  async _onDropActiveEffect( event, effect ) {
    if ( !this.item.isOwner ) return;
    if ( !effect || ( effect.target === this.item ) ) return;
    const keepId = !this.item.effects.has( effect.id );
    await ActiveEffect.create( effect.toObject(), {parent: this.item, keepId} );
  }

  /**
   * Handle a dropped Actor on the ItemSheet.
   * @param {DragEvent} event     The initiating drop event
   * @param {Actor} actor         The dropped Actor document
   * @returns {Promise<void>}
   * @protected
   */
  async _onDropActor( event, actor ) {}

  /**
   * Handle a dropped Item on the Actor Sheet.
   * @param {DragEvent} event     The initiating drop event
   * @param {Item} item           The dropped Item document
   * @returns {Promise<void>}
   * @protected
   */
  async _onDropItem( event, item ) {
    if ( !this.item.isOwner ) return;
  }

  /**
   * Handle a dropped Folder on the Actor Sheet.
   * @param {DragEvent} event     The initiating drop event
   * @param {object} data         Extracted drag transfer data
   * @returns {Promise<void>}
   * @protected
   */
  async _onDropFolder( event, data ) {}

  // endregion

}

