import ED4E from "../../config.mjs";
import SpellEnhancementsConfig from "../configs/spell-enhancements-config.mjs";

const { DocumentSheetV2, HandlebarsApplicationMixin } = foundry.applications.api;

// noinspection JSClosureCompilerSyntax
/**
 * Extend the basic ActorSheet with modifications
 * @augments {ItemSheet}
 */
export default class ItemSheetEd extends HandlebarsApplicationMixin( DocumentSheetV2 ) {
  
  constructor( options = {} ) {
    super( options );
    this.tabGroups = {
      "item-sheet": "general-tab",
    };
  }

  /**
   * @override
   */

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
      config:           ItemSheetEd._onConfig,
      editImage:        ItemSheetEd._onEditImage,
      editEffect:       ItemSheetEd._onEffectEdit,
      deleteEffect:     ItemSheetEd._onEffectDelete,
      addEffect:        ItemSheetEd._onEffectAdd,
    },
    position: {
      top:    50, 
      left:   220,
      width:  800, 
      height: 800,
    }
  };

  // region PARTS
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
    "general-tab": { 
      template: "systems/ed4e/templates/item/item-partials/item-description.hbs", 
      classes:  [ "general" ] 
    },
    "details-tab": { 
      template: "systems/ed4e/templates/item/item-partials/item-details.hbs", 
      classes:  [ "details" ] 
    },
    "effects-tab": { 
      template: "systems/ed4e/templates/item/item-partials/item-details/item-effects.hbs", 
      classes:  [ "effects" ] 
    },
  };

  #getTabs() {
    const tabs = {
      "general-tab":    { id: "general-tab", group: "item-sheet", icon: "fa-solid fa-user", label: "general" },
      "details-tab":    { id: "details-tab", group: "item-sheet", icon: "fa-solid fa-user", label: "details" },
      "effects-tab":     { id: "effects-tab", group: "item-sheet", icon: "fa-solid fa-user", label: "effects" },
    };
    for ( const v of Object.values( tabs ) ) {
      v.active = this.tabGroups[v.group] === v.id;
      v.cssClass = v.active ? "active" : "";
    }
    return tabs;
  }

  // region _prepare Part Context
  async _preparePartContext( partId, contextInput, options ) {
    const context = await super._preparePartContext( partId, contextInput, options );
    switch ( partId ) {
      case "header":
      case "top":
      case "tabs": 
        break;
      case "general-tab":
        break;
      case "details-tab":
        break;
      case "effects-tab":
        break;
    }
    context.tab = context.tabs[partId];
    return context;
  }

  async _prepareContext() {
    
    const context = {
      item:                   this.document,
      system:                 this.document.system,
      options:                this.options,
      systemFields:           this.document.system.schema.fields,
      isGM:                   game.user.isGM,
      // enrichment:             await this.document._enableHTMLEnrichment(),
      // enrichmentEmbededItems: await this.document._enableHTMLEnrichmentEmbeddedItems(),
      config:                 ED4E,
    };

    // context = await super._prepareContext();
    context.tabs = this.#getTabs();

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

  static async _onEffectEdit( event, target ) {
    ui.notifications.info( "Effects not done yet" );
  }

  static async _onEffectDelete( event, target ) {
    ui.notifications.info( "Effects not done yet" );
  }

  static async _onEffectAdd( event, target ) {
    ui.notifications.info( "Effects not done yet" );
  }
}

