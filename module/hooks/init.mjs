// Import configuration
import ED4E from "../config.mjs";
import  "../tours/ed-tours.mjs";
import registerHandlebarHelpers from "../handlebar-helpers.mjs";

// Import submodules
import * as applications from "../applications/_module.mjs";
import * as canvas from "../canvas/_module.mjs";
import * as data from "../data/_module.mjs";
import * as dice from "../dice/_module.mjs";
import * as documents from "../documents/_module.mjs";
import * as enrichers from "../enrichers.mjs";
import * as utils from "../utils.mjs";



/**
 *
 */
export default function () {
  Hooks.once( "init", () => {
    globalThis.ed4e = game.ed4e = Object.assign( game.system, globalThis.ed4e );
    console.log( "ED4e | Initializing the ED4e Game System" );

    // record configuration values
    CONFIG.ED4E = ED4E;
    CONFIG.Actor.documentClass = documents.ActorEd;
    CONFIG.ChatMessage.documentClass = documents.ChatMessageEd;
    CONFIG.Item.documentClass = documents.ItemEd;
    CONFIG.JournalEntry.documentClass = documents.JournalEntryEd;

    CONFIG.Token.objectClass = canvas.TokenEd;

    // Register Roll Extensions
    CONFIG.Dice.rolls.splice( 0, 0, dice.EdRoll );

    // Register text editor enrichers
    enrichers.registerCustomEnrichers();

    // Use active effects within Items
    CONFIG.ActiveEffect.legacyTransferral = false;

    // Hook up system data types
    CONFIG.Actor.dataModels = data.actor.config;
    CONFIG.ChatMessage.dataModels = data.chat.config;
    CONFIG.ActiveEffect.dataModels = data.effects.config;
    CONFIG.Item.dataModels = data.item.config;

    // Register sheet application classes
    Actors.unregisterSheet( "core", ActorSheet );
    Actors.registerSheet( "earthdawn4e", applications.actor.ActorSheetEd, {
      makeDefault: true
    } );
    Actors.registerSheet( "earthdawn4e", applications.actor.ActorSheetEdCharacter, {
      types:       [ "character" ],
      makeDefault: true,
      label:       "ED.Documents.ActorSheetEdCharacter"
    } );
    Actors.registerSheet( "earthdawn4e", applications.actor.ActorSheetEdNpc, {
      types:       [ "npc" ],
      makeDefault: true,
      label:       "ED.Documents.ActorSheetEdNpc"
    } );
    Actors.registerSheet( "earthdawn4e", applications.actor.ActorSheetEdGroup, {
      types:       [ "group" ],
      makeDefault: true,
      label:       "ED.Documents.ActorSheetEdGroup"
    } );
    Items.unregisterSheet( "core", ItemSheet );
    Items.registerSheet( "earthdawn4e", applications.item.ItemSheetEd, {
      makeDefault: true
    } );
    Items.registerSheet( "earthdawn4e", applications.item.ClassItemSheetEd, { 
      types:       [ "discipline", "questor", "path" ],
      makeDefault: true 
    } );
    Items.registerSheet( "earthdawn4e", applications.item.PhysicalItemSheetEd, { 
      types:       [ "armor", "equipment", "shield", "weapon" ],
      makeDefault: true 
    } );
    Journal.unregisterSheet( "core", JournalSheet );
    Journal.registerSheet( "earthdawn4e", applications.journal.JournalSheetEd, {
      makeDefault: true
    } );

    // Register Handlebars Helper
    registerHandlebarHelpers();
    // Preload Handlebars partials.
    utils.preloadHandlebarsTemplates();

    /* -------------------------------------------- */
    /*  System Setting Initialization               */
    /* -------------------------------------------- */

    // registerSystemSettings()

    /* -------------------------------------------- */
    /*  Bundled Module Exports                      */
    /* -------------------------------------------- */
  } );
}
