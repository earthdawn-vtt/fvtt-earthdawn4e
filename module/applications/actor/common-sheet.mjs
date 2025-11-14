import DocumentSheetMixinEd from "../api/document-sheet-mixin.mjs";
import { ED4E } from "../../../earthdawn4e.mjs";
import { getSetting } from "../../settings.mjs";
import TruePatternData from "../../data/thread/true-pattern.mjs";
import PromptFactory from "../global/prompt-factory.mjs";
import { createContentAnchor } from "../../utils.mjs";

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
      addTruePattern:                 ActorSheetEd._onAddTruePattern,
      deleteTruePattern:              ActorSheetEd._onDeleteTruePattern,
      deleteFavorite:                 ActorSheetEd._onDeleteFavorite,
      executeFavoriteMacro:           ActorSheetEd._onExecuteFavoriteMacro,
      expandItem:                     ActorSheetEd._onCardExpand,
      manualOverride:                 ActorSheetEd._onManualOverride,
      toggleTruePatternKnownToPlayer: ActorSheetEd._onToggleTruePatternKnownToPlayer,
      weaveThread:                    ActorSheetEd._onWeaveThread,
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
    "connections",
    "specials",
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

    const favoriteResults = await Promise.all(
      this.document.system.favorites.map( async ( uuid ) => {
        const macro = await fromUuid( uuid );
        return {
          uuid:    uuid,
          name:    macro?.name || game.i18n.localize( "ED.Actor.Header.Favorites.brokenReference" ),
          isValid: !!macro,
          macro:   macro
        };
      } )
    );

    foundry.utils.mergeObject( context, {
      actor:                  this.document,
      items:                  this.document.items,
      icons:                  ED4E.icons,
      favoriteItems:          favoriteResults,
    } );

    return context;
  }

  /** @inheritDoc */
  async _preparePartContext( partId, context, options ) {
    const newContext = await super._preparePartContext( partId, context, options );
    switch ( partId ) {
      case "connections":
        newContext.threadConnectedItems = {};
        for ( const thread of this.document.itemTypes.thread ) {
          const connectedItem = await thread.system.getConnectedDocument();
          context.threadConnectedItems[ thread.id ] = connectedItem ? createContentAnchor( connectedItem ).outerHTML : null;
        }
        newContext.canHaveTruePattern = TruePatternData.isAllowedInDocument( this.document );
        newContext.showTruePattern = this.document.system.truePattern !== null
          && ( game.user.isGM || this.document.system.truePattern?.knownToPlayer );
        break;
    }
    return newContext;
  }

  /** @inheritdoc */
  async _renderHTML( context, options ) {
    return super._renderHTML( context, options );
  }

  // endregion

  // region Event Handlers

  /**
   * @type {ApplicationClickAction}
   * @this {ActorSheetEd}
   */
  static async _onAddTruePattern( event, target ) {
    event.preventDefault();
    const truePatternData = {};
    if ( this.document.type === "group" ) truePatternData.tier = "warden";
    await this.document.update( {
      "system.truePattern": new TruePatternData( truePatternData ),
    } );
    await this.render();
  }

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

  /**
   * @type {ApplicationClickAction}
   * @this {ActorSheetEd}
   */
  static async _onDeleteFavorite( event, target ) {
    const macroUuid = target.dataset.macroUuid;

    // Use shift-click for quick delete like deleteChild does
    if ( getSetting( "quickDeleteEmbeddedOnShiftClick" ) && event.shiftKey ) {
      const currentFavorites = this.document.system.favorites || [];
      const updatedFavorites = currentFavorites.filter( uuid => uuid !== macroUuid );

      // Delete the macro from the world
      const macro = await fromUuid( macroUuid );
      if ( macro ) await macro.delete();

      return this.document.update( {
        "system.favorites": updatedFavorites
      } );
    }

    const type = `${game.i18n.localize( "ED.Dialogs.DeleteFavorite.favorite" )}`;
    return Dialog.confirm( {
      title:   `${game.i18n.format( "DOCUMENT.Delete", { type } )}`,
      content: `<h4>${game.i18n.localize( "AreYouSure" )}</h4>
              <p>${game.i18n.format( "SIDEBAR.DeleteWarning", { type } )}</p>
              <p>${game.i18n.localize( "ED.Dialogs.DeleteFavorite.alsoDeletesMacro" )}</p>`,
      yes: async () => {
        const currentFavorites = this.document.system.favorites || [];
        const updatedFavorites = currentFavorites.filter( uuid => uuid !== macroUuid );

        // Delete the macro from the world
        const macro = await fromUuid( macroUuid );
        if ( macro ) await macro.delete();

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

  /**
   * @type {ApplicationClickAction}
   * @this {ActorSheetEd}
   */
  static async _onDeleteTruePattern( event, target ) {
    event.preventDefault();
    const confirmedDelete = await PromptFactory.genericDeleteConfirmationPrompt(
      this.document.system.schema.fields.truePattern.label,
      event.shiftKey,

    );
    if ( !confirmedDelete ) return;

    await this.document.update( {
      "system.truePattern": null,
    } );
    await this.render();
  }

  /**
   * @type {ApplicationClickAction}
   * @this {ActorSheetEd}
   */
  static async _onExecuteFavoriteMacro( event, target ) {
    const macro = /** @type {Macro} */ await fromUuid( target.dataset.macroUuid );
    if ( !macro ) {
      ui.notifications.warn( game.i18n.localize( "ED.Actor.Header.Favorites.macroNotFound" ) );
      return;
    }
    macro.execute();
  }

  /**
   * @type {ApplicationClickAction}
   * @this {ActorSheetEd}
   */
  static async _onManualOverride( event, target ) {
    event.preventDefault();

    const overrideOperation = target.dataset.overrideOperation?.toLowerCase();
    if ( ![ "increase", "decrease" ].includes( overrideOperation ) ) throw new Error( `Unknown override operation: ${overrideOperation}` );

    const sign = ( overrideOperation === "decrease" ) ? -1 : 1;
    const changeKey = target.parentElement.querySelector( "input" ).name;
    const changeValue = ( event.shiftKey ? 5 : 1 ) * sign;

    await this.document.manualOverride( changeKey, changeValue );
  }

  /**
   * @type {ApplicationClickAction}
   * @this {PhysicalItemSheetEd}
   */
  static async _onToggleTruePatternKnownToPlayer( event, target ) {
    event.preventDefault();
    const currentValue = this.document.system.truePattern?.knownToPlayer;

    if ( foundry.utils.getType( currentValue ) === "boolean" ) await this.document.update( {
      "system.truePattern.knownToPlayer": !currentValue,
    } );
  }

  /**
   * @type {ApplicationClickAction}
   * @this {ThreadItemSheet}
   */
  static async _onWeaveThread( event, target ) {
    event.preventDefault();

    const actor = game.user.character
      ?? await PromptFactory.chooseActorPrompt(
        [],
        game.user.isGM ? "" : "character",
        {}
      );
    if ( !actor ) {
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.weaveThreadNoActor" ) );
      return;
    }

    await actor.weaveThread( this.document );
  }

  /**
   * Handles adding an item to the actor's favorites.
   * @param {HTMLElement} target - The HTML element that triggered the action.
   * @returns {Promise<void>}
   */
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
