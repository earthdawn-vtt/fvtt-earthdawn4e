import EdTour from "../tours/ed-tours.mjs";
import EdRollOptions from "../data/roll/common.mjs";
import DialogEd from "../applications/api/dialog.mjs";
import { SYSTEM_TYPES } from "../constants/constants.mjs";
import { getSetting, setSetting } from "../helpers/settings.mjs";

/**
 *
 */
export default function () {
  Hooks.once( "ready", async () => {

    // region Debug Documents

    if ( getSetting( "debugMode" ) ) await _createDebugDocuments();

    // endregion

    // region Tours

    EdTour.travelAgency();

    // endregion

    // region Updates

    const currentVersion = game.system.version;
    const lastSeenVersion = getSetting( "lastSeenVersion" );
    const isNewVersion = foundry.utils.isNewerVersion( currentVersion, lastSeenVersion );

    if (
      isNewVersion
      || getSetting( "hideUpdateNews" ) === false
    ) {
      await _showUpdateNews();
      if ( isNewVersion ) await setSetting( "lastSeenVersion", currentVersion );
    }

    // endregion

  } );
}

/**
 * Creation of actors and items for debugging purposes
 */
async function _createDebugDocuments() {

  /* -------------------------------------------- */
  /*  Documents                                   */
  /* -------------------------------------------- */
  // Create one document for each type
  // after deleting already existing debug documents

  for ( const collection of [ "folders", "items", "actors", "journal" ] ) {
    for ( const document of game[collection] ) {
      if ( document.flags.deleteOnStartup ) await document.delete();
    }
  }

  const actorFolder = await Folder.create( {
    name:        "DebugActors",
    type:        "Actor",
    description: "<p>Contains data created for debugging purposes</p>",
    color:       "#efdaca",
    flags:       { deleteOnStartup: true },
  } );
  const itemFolder = await Folder.create( {
    name:        "DebugItems",
    type:        "Item",
    description: "<p>Contains data created for debugging purposes</p>",
    color:       "#efdaca",
    flags:       { deleteOnStartup: true },
  } );

  const createdActors = {};
  const createdItems = {};
  for ( const actorType of Object.keys( CONFIG.Actor.dataModels ) ) {
    createdActors[actorType] = await ed4e.documents.ActorEd.create( {
      name:   actorType,
      type:   actorType,
      folder: actorFolder.id,
      flags:  { deleteOnStartup: true },
    } );
  }
  for ( const itemType of Object.keys( CONFIG.Item.dataModels ) ) {
    createdItems[itemType] = await ed4e.documents.ItemEd.create( {
      name:   itemType,
      type:   itemType,
      folder: itemFolder.id,
      flags:  { deleteOnStartup: true },
    } );
  }

  // Prepare documents

  const character = createdActors[ SYSTEM_TYPES.Actor.pc ];
  await character.createEmbeddedDocuments( "Item", [
    createdItems.armor.toObject(),
    createdItems.devotion.toObject(),
    createdItems.discipline.toObject(),
    createdItems.equipment.toObject(),
    createdItems.namegiver.toObject(),
    createdItems.questor.toObject(),
    createdItems.shield.toObject(),
    createdItems.skill.toObject(),
    createdItems.talent.toObject(),
    createdItems.weapon.toObject(),
  ] );

  /* -------------------------------------------- */
  /*  Journal Entries                             */
  /* -------------------------------------------- */

  const journalData = {
    "name":  "journal entry",
    "pages": [
      {
        "sort":  100000,
        "name":  "fff",
        "type":  "text",
        "title": {"show": true,"level": 1},
        "text":  {
          "content": "<p>First, take @Roll( /s 13 + 1 )(Acid Damage)(damage) if you want to do it.</p>",
        },
      }
    ]
    ,"folder": null,
    "sort":   0,
    "flags":  { deleteOnStartup: true },
  };
  await JournalEntry.create( journalData );

  /* -------------------------------------------- */
  /*  Dice                                        */
  /* -------------------------------------------- */
  // Create a dice roll for each roll type with all possible options and evaluate it to chat

  for ( const message of game.messages ) {
    if ( message.getFlag( "world", "deleteOnStartup" ) ) await message.delete();
  }

  const rollParameters = {
    arbitrary: {
      step:     38,
      karma:    4,
      devotion: 2,
    },
    action: {
      step:     38,
      karma:    1,
      devotion: 0,
    },
    damage: {
      step:     12,
      karma:    0,
      devotion: 0,
    },
    effect: {
      step:     8,
      karma:    0,
      devotion: 1,
    },
  };

  for( const testType of Object.keys( CONFIG.ED4E.testTypes ) ) {
    const rollOptions = new EdRollOptions( {
      testType:   testType,
      chatFlavor: "This is debug custom flavor text for this roll. Great, he?",
      step:       {
        base:      rollParameters[testType].step,
        modifiers: {
          manual: 1
        }
      },
      karma: {
        pointsUsed: rollParameters[testType].karma,
        available:  0,
        step:       9
      },
      devotion: {
        pointsUsed: rollParameters[testType].devotion,
        available:  0,
        step:       4
      },
      extraDice: {
        "Flame Weapon": 4,
        "Night's Edge": 2
      },
      target: {
        base:      14,
        modifiers: {
          "Earth Armor": 2
        }
      }
    } );
    const roll = ed4e.dice.EdRoll.create(
      undefined,
      {},
      rollOptions
    );

    const rollMsg = await roll.toMessage();
    await rollMsg.setFlag( "world", "deleteOnStartup", true );
  }
}

/**
 * Display the update news dialog
 */
async function _showUpdateNews() {
  const html = await foundry.applications.handlebars.renderTemplate(
    "systems/ed4e/templates/system-messages/update-message.hbs",
    {
      version: game.system.version,
    }
  );
  DialogEd.wait( {
    title:   _loc( "ED.Dialogs.Header.update" ),
    content: html,
    buttons: [
      {
        action:   "ok",
        label:    "ED.Dialogs.Buttons.ok",
        default: true
      },
      {
        action:   "notAgain",
        label:    "ED.Dialogs.Buttons.notAgain",
        callback: () => {
          setSetting( "hideUpdateNews", true );
        }
      }
    ]
  } );
}
