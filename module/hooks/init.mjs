// Import configuration
import ED4E from "../config/_module.mjs";
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
import { staticStatusId } from "../utils.mjs";

const { DocumentSheetConfig } = foundry.applications.apps;
const { ActiveEffectConfig } = foundry.applications.sheets;
const { Actors, Items, Journal } = foundry.documents.collections;

/**
 *
 */
export default function () {
  Hooks.once( "init", () => {
    globalThis.ed4e = game.ed4e = Object.assign( game.system, globalThis.ed4e );
    console.log( "ED4e | Initializing the ED4e Game System" );

    // record configuration values
    CONFIG.ED4E = ED4E;
    CONFIG.ActiveEffect.documentClass = documents.EarthdawnActiveEffect;
    CONFIG.Actor.documentClass = documents.ActorEd;
    CONFIG.ChatMessage.documentClass = documents.ChatMessageEd;
    CONFIG.Combat.documentClass = documents.CombatEd;
    CONFIG.Combatant.documentClass = documents.CombatantEd;
    CONFIG.Item.documentClass = documents.ItemEd;
    CONFIG.JournalEntry.documentClass = documents.JournalEntryEd;

    CONFIG.Token.objectClass = canvas.TokenEd;
    CONFIG.Token.hudClass = applications.hud.TokenHUDEd;

    CONFIG.ui.combat = applications.combat.CombatTrackerEd;

    // Register Roll Extensions
    CONFIG.Dice.rolls.splice( 0, 0, dice.EdRoll );

    // Register text editor enrichers
    enrichers.registerCustomEnrichers();

    // Use active effects within Items
    CONFIG.ActiveEffect.legacyTransferral = false;

    // Set Status Effects
    CONFIG.statusEffects = ED4E.statusEffects.map( ( status ) => {
      return {
        _id: staticStatusId( status.id ),
        ...status,
      };
    } );
    Object.assign( CONFIG.specialStatusEffects, ED4E.specialStatusEffects );

    // Hook up system data types
    CONFIG.ActiveEffect.dataModels = data.effects.config;
    CONFIG.Actor.dataModels = data.actor.config;
    CONFIG.ChatMessage.dataModels = data.chat.config;
    CONFIG.Combatant.dataModels = data.combatant.config;
    CONFIG.Item.dataModels = data.item.config;

    // Register sheet application classes
    Actors.unregisterSheet( "core", foundry.appv1.sheets.ActorSheet );
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
    Actors.registerSheet( "earthdawn4e", applications.actor.ActorSheetEdVehicle, {
      types:       [ "vehicle" ],
      makeDefault: true,
      label:       "ED.Documents.ActorSheetEdVehicle"
    } );
    Actors.registerSheet( "earthdawn4e", applications.actor.ActorSheetEdLoot, {
      types:       [ "loot" ],
      makeDefault: true,
      label:       "ED.Documents.ActorSheetEdLoot"
    } );
    Actors.registerSheet( "earthdawn4e", applications.actor.ActorSheetEdTrap, {
      types:       [ "trap" ],
      makeDefault: true,
      label:       "ED.Documents.ActorSheetEdTrap"
    } );
    Actors.registerSheet( "earthdawn4e", applications.actor.ActorSheetEdCreature, {
      types:       [ "creature" ],
      makeDefault: true,
      label:       "ED.Documents.ActorSheetEdCreature"
    } );
    Actors.registerSheet( "earthdawn4e", applications.actor.ActorSheetEdSpirit, {
      types:       [ "spirit" ],
      makeDefault: true,
      label:       "ED.Documents.ActorSheetEdSpirit"
    } );
    Actors.registerSheet( "earthdawn4e", applications.actor.ActorSheetEdDragon, {
      types:       [ "dragon" ],
      makeDefault: true,
      label:       "ED.Documents.ActorSheetEdDragon"
    } );
    Actors.registerSheet( "earthdawn4e", applications.actor.ActorSheetEdHorror, {
      types:       [ "horror" ],
      makeDefault: true,
      label:       "ED.Documents.ActorSheetEdHorror"
    } );

    DocumentSheetConfig.unregisterSheet( ActiveEffect, "core", ActiveEffectConfig );
    DocumentSheetConfig.registerSheet(
      ActiveEffect,
      "earthdawn4e",
      applications.effect.EarthdawnActiveEffectSheet,
      { makeDefault: true },
    );

    Items.unregisterSheet( "core", foundry.appv1.sheets.ItemSheet );
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
    Journal.unregisterSheet( "core", foundry.appv1.sheets.JournalSheet );
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
