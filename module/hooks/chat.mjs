import EdRollOptions from "../data/roll/common.mjs";
import PcData from "../data/actor/pc.mjs";
import LpTransactionData from "../data/advancement/lp-transaction.mjs";


const cmdMapping = {
  char:  triggerCharGen,
  coin:  triggerCoinAward,
  group: triggerCrCalc,
  h:     triggerHelp,
  help:  triggerHelp,
  lp:    triggerLpAward,
  r:     triggerRollDice,
  roll:  triggerRollDice,
  s:     triggerRollStep,
};

/**
 *
 */
export default function () {
  /**
   * Primary use of this hook is to intercept chat commands.
   * /char Triggers Character Generation
   * /coin Triggers awarding Silver for players
   * /group Triggers Group calculation for Challenging rates
   * /help - Display a help message on all the commands above
   * /lp Triggers awarding legend points for players
   * /r Triggers standard dice rolls (e.g., /r 1d6, /r 2d10+3)
   * /roll Triggers standard dice rolls (e.g., /roll 1d6, /roll 2d10+3)
   * /s Triggers Step roll
   */
  Hooks.on( "chatMessage", ( html, content, msg ) => {
    if ( !Object.keys( CONFIG.ED4E.chatCommands ).some( ( cmd ) => content.startsWith( `/${cmd.toLowerCase()}` ) ) ) {
      // No ED command, continue Foundry workflow
      return true;
    }

    // Setup new message's visibility
    let rollMode = game.settings.get( "core", "rollMode" );
    if ( [ "gmroll", "blindroll" ].includes( rollMode ) )
      msg["whisper"] = ChatMessage.getWhisperRecipients( "GM" ).map( ( u ) => u.id );
    if ( rollMode === "blindroll" ) msg["blind"] = true;

    const cmdRegExp = /(?<command>\/\w+)(?<arguments>.*)/;
    const commandMatches = content.match( cmdRegExp );

    return cmdMapping[commandMatches.groups.command.substring( 1 )]( commandMatches.groups.arguments.trim() );
  } );

  Hooks.on( "renderChatMessageHTML", async ( message, html, context ) => {
    if ( message.system.alterMessageHTML instanceof Function )
      await message.system.alterMessageHTML( html, context );

    if ( message.system.attachListeners instanceof Function )
      await message.system.attachListeners( html );
  } );
}

// region Chat Commands

/**
 * Triggers the character generation process.
 * @param {string} argString - The argument string from the original chat message passed to the command .
 * @returns {boolean} Always returns false to prevent further processing.
 */
function triggerCharGen( argString ) {
  PcData.characterGeneration();
  return false;
}

/* -------------------------------------------- */

/**
 * Trigger the coin award process with /coin.
 * @param {string} argString - The argument string from the original chat message passed to the command.
 * @returns {boolean} Always returns false to prevent further processing.
 */
function triggerCoinAward( argString ) {
  ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.notImplementedYet" ) );
  return false;
}

/* -------------------------------------------- */

/**
 * Trigger the challenge rating calculation process with /group.
 * @param {string} argString - The argument string from the original chat message passed to the command.
 * @returns {boolean} Always returns false to prevent further processing.
 */
function triggerCrCalc( argString ) {
  ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.notImplementedYet" ) );
  return false;
}

/* -------------------------------------------- */

/**
 * Trigger the help command to display a list of available chat commands with /help or /h.
 * @param {string} argString - The argument string from the original chat message passed to the command.
 * @returns {boolean} Always returns false to prevent further processing.
 */
function triggerHelp( argString ) {
  const helpText
    = CONFIG.ED4E.chatCommands[argString.toLowerCase()]
    ?? `${ game.i18n.localize( "ED.Chat.Commands.helpHeader" ) }<br>
    /char - ${ game.i18n.localize( "ED.Chat.Commands.char" ) }<br>
    /coin - ${ game.i18n.localize( "ED.Chat.Commands.coin" ) }<br>
    /group - ${ game.i18n.localize( "ED.Chat.Commands.group" ) }<br>
    /help - ${ game.i18n.localize( "ED.Chat.Commands.help" ) }<br>
    /lp - ${ game.i18n.localize( "ED.Chat.Commands.lp" ) }<br>
    /r - ${ game.i18n.localize( "ED.Chat.Commands.r" ) }<br>
    /roll - ${ game.i18n.localize( "ED.Chat.Commands.roll" ) }<br>
    /s - ${ game.i18n.localize( "ED.Chat.Commands.s" ) }<br>
    `;

  ChatMessage.create( {
    content: helpText,
  } );

  return false;
}

/* -------------------------------------------- */
/**
 * Triggers the legend point award process with /lp.
 * @param {string} argString - The argument string from the original chat message passed to the command.
 * @returns {boolean} Always returns false to prevent further processing.
 */
function triggerLpAward( argString ) {
  LpTransactionData.assignLpPrompt();

  return false;
}

/* -------------------------------------------- */
/**
 * Triggers a step roll with /s.
 * @param {string} argString - The argument string from the original chat message passed to the command.
 * @returns {boolean} Always returns false to prevent further processing.
 */
function triggerRollStep( argString ) {
  const argRegExp = /(\d+)(?=\s*\+?\s*)/g;
  const steps = argString.match( argRegExp );

  if ( !steps ) return true;

  steps.forEach( ( currentStep ) =>
    new ed4e.dice.EdRoll(
      undefined,
      {},
      new EdRollOptions( {
        rollType: "arbitrary",
        step:     {
          total: Number( currentStep )
        }
      } )
    ).toMessage(),
  );
  return false;
}

/* -------------------------------------------- */
/**
 * Triggers a standard dice roll with /r or /roll.
 * @param {string} argString - The argument string from the original chat message passed to the command.
 * @returns {boolean} Always returns false to prevent further processing.
 */
function triggerRollDice( argString ) {
  if ( !argString.trim() ) {
    ui.notifications.warn( game.i18n.localize( "ED.Chat.Flavor.provideDiceFormula" ) );
    return false;
  }

  try {
    // Create a standard Foundry roll with the dice formula
    const roll = new Roll( argString.trim() );
    roll.toMessage( {
      flavor: game.i18n.localize( "ED.Chat.Flavor.standardDiceRoll" )
    } );
  } catch ( error ) {
    ui.notifications.error( `${ game.i18n.localize( "ED.Chat.Flavor.invalidDiceFormula" ) }: ${ argString }` );
    console.error( "Dice roll error:", error );
  }
  
  return false;
}

// endregion