import DocumentSheetMixinEd from "../api/document-sheet-mixin.mjs";
import { ED4E } from "../../../earthdawn4e.mjs";
import { getSetting } from "../../settings.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;

/**
 * Extend the basic ActorSheet with modifications
 * @augments {ActorSheetV2}
 * @mixes DocumentSheetMixinEd
 */
export default class ActorSheetEd extends DocumentSheetMixinEd( ActorSheetV2 ) {

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes:  [ "actor", ],
    actions:  {
      expandItem:           ActorSheetEd._onCardExpand,
      executeFavoriteMacro: ActorSheetEd._executeFavoriteMacro,
      deleteFavorite:       ActorSheetEd._deleteFavorite,
    },
  };

  /** @inheritdoc */
  static TABS = {
    sheet: {
      tabs:        [],
      initial:     "general",
      labelPrefix: "ED.Tabs.ActorSheet",
    },
  };

  /**
   * Defines the order of tabs in the actor sheet.
   * @type {Array<string>}
   */
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
  ];

  /**
   * Adds custom tabs to the actor sheet.
   * @param {object[]} tabs - An array of tab configurations to add. Each tab should include:
   * @param {string} tabs.id  The unique identifier for the tab.
   * @param {string} tabs.label The label for the tab (used for localization).
   * @param {string} tabs.template The path to the Handlebars template for the tab's content.
   */
  static addSheetTabs( tabs ) {
    this.TABS = foundry.utils.deepClone( this.TABS );
    this.TABS.sheet.tabs.push( ...tabs );
    this.TABS.sheet.tabs.sort(
      ( a, b ) => this.TAB_ORDER_SHEET.indexOf( a.id ) - this.TAB_ORDER_SHEET.indexOf( b.id )
    );
  }

  // region Rendering

  /** @inheritdoc */
  async _onFirstRender( context, options ) {
    await super._onFirstRender( context, options );

    this._createContextMenu(
      this._createInitialContextMenu,
      ".favoritable",
    );
  }

  _createInitialContextMenu() {
    return [
      {
        name:      game.i18n.localize( "ED.ContextMenu.favoritable" ),
        icon:      "<i class='fas fa-star'></i>",
        callback:  this._onAddToFavorites.bind( this ),
      },
    ];
  }

  /** @inheritdoc */
  async _prepareContext( options ) {
    const context = await super._prepareContext( options );

    const favoriteItems = await Promise.all(
      this.document.system.favorites.map( ( uuid ) => fromUuid( uuid ) )
    );

    foundry.utils.mergeObject( context, {
      actor:                  this.document,
      items:                  this.document.items,
      icons:                  ED4E.icons,
      favoriteItems:          favoriteItems,
    } );

    return context;
  }

  /** @inheritdoc */
  async _renderHTML( context, options ) {
    return super._renderHTML( context, options );
  }

  // endregion

  // region Event Handlers

  /**
   * Expanding or collapsing the item description
   * @param {Event} event - The event that triggered the form submission.
   * @param {HTMLElement} target - The HTML element that triggered the action.
   * @returns {Promise<void>} - A promise that resolves when the item description is expanded or collapsed.
   */
  static async _onCardExpand( event, target ) {
    event.preventDefault();

    const itemDescription = $( target )
      .parent( ".item-id" )
      .parent( ".card__ability" )
      .children( ".card__description" );

    itemDescription.toggleClass( "card__description--toggle" );
  }

  static async _executeFavoriteMacro( event, target ) {
    const macro = /** @type {Macro} */ await fromUuid( target.dataset.macroUuid );
    macro.execute();
  }

  static async _deleteFavorite( event, target ) {
    const macroUuid = target.dataset.macroUuid;
    // Use shift-click for quick delete like deleteChild does
    if ( getSetting( "quickDeleteEmbeddedOnShiftClick" ) && event.shiftKey ) {
      const currentFavorites = this.document.system.favorites || [];
      const updatedFavorites = currentFavorites.filter( uuid => uuid !== macroUuid );
      return this.document.update( {
        "system.favorites": updatedFavorites
      } );
    }
    const type = `${game.i18n.localize( "ED.Dialogs.DeleteFavorite.favorite" )}`;
    return Dialog.confirm( {
      title:   `${game.i18n.localize( "DOCUMENT.Delete" )}`,
      content: `<h4>${game.i18n.localize( "AreYouSure" )}</h4><p>${game.i18n.format( "SIDEBAR.DeleteWarning", { type } )}</p>`,
      yes:     async () => {
        const currentFavorites = this.document.system.favorites || [];
        const updatedFavorites = currentFavorites.filter( uuid => uuid !== macroUuid );
        await this.document.update( {
          "system.favorites": updatedFavorites
        } );
      },
      options: {
        top:   Math.min( event.clientY - 80, window.innerHeight - 350 ),
        left:  window.innerWidth - 720,
        width: 400
      }
    } );
  }

  async _onAddToFavorites( target ) {
    const itemUuid = target.closest( ".favoritable" ).dataset.uuid;
    if ( !itemUuid ) {
      throw new Error( "ActorSheetEd._onAddToFavorites:  No item UUID found in the target element." );
    }
    const item = /** @type {ItemEd} */ await fromUuid( itemUuid );
    const macro = await item.toMacro();

    const oldFavorites = this.document.system.favorites ?? [];
    await this.document.update( {
      "system.favorites": [ ...oldFavorites, macro.uuid ],
    } );
  }

  // endregion


  
}
