// Import configuration
import * as config from "../config/_module.mjs";
import ED4E_CONSTANTS from "../constants/_module.mjs";
import  "../tours/ed-tours.mjs";
import registerHandlebarHelpers from "../handlebar-helpers.mjs";
import { initializeMigrations } from "../services/migrations/_module.mjs";

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
const { ActiveEffectConfig, CombatantConfig } = foundry.applications.sheets;
const { Actors, Items, Journal, Scenes } = foundry.documents.collections;

/**
 *
 */
function setupDocumentClasses() {
  for ( const DocumentClass of Object.values( documents ) ) {
    if ( !foundry.utils.isSubclass( DocumentClass, foundry.abstract.Document ) ) continue;
    CONFIG[DocumentClass.documentName].documentClass = DocumentClass;
  }
}

/**
 *
 */
function setupCollections() {
  CONFIG.User.collection = documents.collections.UsersEd;
}

/**
 *
 */
function setupUI() {
  CONFIG.ui.combat = applications.combat.CombatTrackerEd;
}

/**
 *
 */
function setupCanvas() {
  CONFIG.Token.objectClass = canvas.TokenEd;
  CONFIG.Token.hudClass = applications.hud.TokenHUDEd;
  CONFIG.Combat.fallbackTurnMarker = "systems/ed4e/assets/foundry/pause.png";
}

/**
 *
 */
function setupStatusEffects() {
  CONFIG.statusEffects = config.STATUSES.statusEffects.map( ( status ) => {
    return {
      _id: staticStatusId( status.id ),
      ...status
    };
  } );
  Object.assign( CONFIG.specialStatusEffects, config.STATUSES.specialStatusEffects );
}

/**
 *
 */
function setupDataModels() {
  for ( const [ doc, models ] of Object.entries( data ) ) {
    if ( !CONST.ALL_DOCUMENT_TYPES.includes( doc ) ) continue;
    for ( const ModelClass of Object.values( models ) ) {
      if ( ModelClass.metadata?.type ) CONFIG[doc].dataModels[ModelClass.metadata.type] = ModelClass;
      if ( ModelClass.metadata?.icon ) CONFIG[doc].typeIcons[ModelClass.metadata.type] = ModelClass.metadata.icon;
    }
  }
}

/**
 *
 */
function setupQueries() {
  Object.assign( CONFIG.queries, config.SOCKETS.queries );
}

/**
 *
 */
function setupRolls() {
  CONFIG.Dice.rolls.splice( 0, 0, dice.EdRoll );
}

/**
 *
 */
function setupTextEditor() {
  enrichers.registerCustomEnrichers();
}

/**
 *
 */
function registerSheetApps() {
  Actors.registerSheet( "earthdawn4e", applications.actor.ActorSheetEd, {
    makeDefault: true
  } );
  Actors.registerSheet( "earthdawn4e", applications.actor.ActorSheetEdCharacter, {
    types:       [ data.actor.PcData.metadata.type ],
    makeDefault: true,
    label:       "ED.Documents.actorSheetEdCharacter"
  } );
  Actors.registerSheet( "earthdawn4e", applications.actor.ActorSheetEdNpc, {
    types:       [ data.actor.NpcData.metadata.type ],
    makeDefault: true,
    label:       "ED.Documents.actorSheetEdNpc"
  } );
  Actors.registerSheet( "earthdawn4e", applications.actor.ActorSheetEdGroup, {
    types:       [ data.actor.GroupData.metadata.type ],
    makeDefault: true,
    label:       "ED.Documents.actorSheetEdGroup"
  } );
  Actors.registerSheet( "earthdawn4e", applications.actor.ActorSheetEdVehicle, {
    types:       [ data.actor.VehicleData.metadata.type ],
    makeDefault: true,
    label:       "ED.Documents.actorSheetEdVehicle"
  } );
  Actors.registerSheet( "earthdawn4e", applications.actor.ActorSheetEdLoot, {
    types:       [ data.actor.LootData.metadata.type ],
    makeDefault: true,
    label:       "ED.Documents.actorSheetEdLoot"
  } );
  Actors.registerSheet( "earthdawn4e", applications.actor.ActorSheetEdTrap, {
    types:       [ data.actor.TrapData.metadata.type ],
    makeDefault: true,
    label:       "ED.Documents.actorSheetEdTrap"
  } );
  Actors.registerSheet( "earthdawn4e", applications.actor.ActorSheetEdCreature, {
    types:       [ data.actor.CreatureData.metadata.type ],
    makeDefault: true,
    label:       "ED.Documents.actorSheetEdCreature"
  } );
  Actors.registerSheet( "earthdawn4e", applications.actor.ActorSheetEdSpirit, {
    types:       [ data.actor.SpiritData.metadata.type ],
    makeDefault: true,
    label:       "ED.Documents.actorSheetEdSpirit"
  } );
  Actors.registerSheet( "earthdawn4e", applications.actor.ActorSheetEdDragon, {
    types:       [ data.actor.DragonData.metadata.type ],
    makeDefault: true,
    label:       "ED.Documents.actorSheetEdDragon"
  } );
  Actors.registerSheet( "earthdawn4e", applications.actor.ActorSheetEdHorror, {
    types:       [ data.actor.HorrorData.metadata.type ],
    makeDefault: true,
    label:       "ED.Documents.actorSheetEdHorror"
  } );

  DocumentSheetConfig.unregisterSheet( ActiveEffect, "core", ActiveEffectConfig );
  DocumentSheetConfig.registerSheet(
    ActiveEffect,
    "earthdawn4e",
    applications.effect.EarthdawnActiveEffectSheet,
    {
      makeDefault: true,
      label:       "ED.Documents.activeEffectSheetEd"
    }
  );

  DocumentSheetConfig.unregisterSheet( Combatant, "core", CombatantConfig );
  DocumentSheetConfig.registerSheet(
    Combatant,
    "earthdawn4e",
    applications.combat.CombatantConfigEd,
    { makeDefault: true }
  );

  Items.registerSheet( "earthdawn4e", applications.item.ItemSheetEd, {
    makeDefault: true,
    label:       "ED.Documents.itemSheetEd"
  } );
  Items.registerSheet( "earthdawn4e", applications.item.ClassItemSheetEd, {
    types:       [
      data.item.DisciplineData.metadata.type,
      data.item.QuestorData.metadata.type,
      data.item.PathData.metadata.type,
    ],
    makeDefault: true,
    label:       "ED.Documents.itemSheetEdClass"
  } );
  Items.registerSheet( "earthdawn4e", applications.item.PhysicalItemSheetEd, {
    types:       [
      data.item.ArmorData.metadata.type,
      data.item.EquipmentData.metadata.type,
      data.item.ShieldData.metadata.type,
      data.item.WeaponData.metadata.type,
    ],
    makeDefault: true,
    label:       "ED.Documents.itemSheetEdPhysical"
  } );
  Items.registerSheet( "earthdawn4e", applications.item.MaskItemSheetEd, {
    types:       [ data.item.MaskData.metadata.type ],
    makeDefault: true,
    label:       "ED.Documents.itemSheetEdMask"
  } );
  Items.registerSheet( "earthdawn4e", applications.item.ThreadItemSheetEd, {
    types:       [ data.item.ThreadData.metadata.type ],
    makeDefault: true,
    label:       "ED.Documents.itemSheetEdThread"
  } );

  Journal.registerSheet( "earthdawn4e", applications.journal.JournalSheetEd, {
    makeDefault: true,
    label:       "ED.Documents.journalSheetEd"
  } );

  Scenes.unregisterSheet( "core", foundry.applications.sheets.SceneConfig );
  Scenes.registerSheet( "earthdawn4e", applications.scene.SceneConfigEd, {
    makeDefault: true,
    label:       "ED.Documents.sceneConfigEd"
  } );
}

/**
 *
 */
function setupHandlebars() {
  registerHandlebarHelpers();
  utils.preloadHandlebarsTemplates();
}

/**
 *
 */
function setupConfigConstants() {
  globalThis.ED4E_CONSTANTS = ED4E_CONSTANTS;
  CONFIG.ED4E = config.default;
}

/**
 *
 */
export default function () {
  Hooks.once( "init", () => {
    globalThis.ed4e = game.ed4e = Object.assign( game.system, globalThis.ed4e );
    console.log( "ED4e | Initializing the ED4e Game System" );

    setupConfigConstants();
    setupDocumentClasses();
    setupCanvas();
    setupUI();
    setupCollections();
    setupQueries();
    setupRolls();
    setupTextEditor();
    setupStatusEffects();
    setupDataModels();
    initializeMigrations();
    registerSheetApps();
    setupHandlebars();

  } );
}
