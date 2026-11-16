import EdRoll from "../dice/ed-roll.mjs";
import EdRollOptions from "../data/roll/common.mjs";
import getDice from "../dice/step-tables.mjs";
import * as ROLLS from "../config/rolls.mjs";

/**
 * Set up custom enrichers.
 */
export function registerCustomEnrichers() {
  CONFIG.TextEditor.enrichers.push(
    {
      pattern:  /@(?<type>roll)\(\s*(?<rollCmd>\/s\s*\d+(?:[^()]|\((?:[^()]|\([^()]*\))*\))*)\)(?:\s*\((?<flavor>[^()]*)\))?(?:\s*\((?<testType>action|effect|damage)\))?/gi,
      enricher: enrichString,
    },
  );

  document.body.addEventListener( "click", rollAction );
}

/* -------------------------------------------- */

/**
 * Parse the enriched string and provide the appropriate content.
 * @param {RegExpMatchArray} match       The regular expression match result.
 * @param {EnrichmentOptions} options    Options provided to customize text enrichment.
 * @returns {Promise<HTMLElement|null>}  An HTML element to insert in place of the matched text or null to
 *                                       indicate that no replacement should be made.
 */
async function enrichString( match, options ) {
  switch ( match.groups.type.toLowerCase() ) {
    case "roll": return enrichRoll( match, options );
  }
  return null;
}

/* -------------------------------------------- */

/**
 * Parse the embedded roll and provide the appropriate content.
 * @param {RegExpMatchArray} match     The regular expression match result.
 * @param {EnrichmentOptions} options Options provided to customize text enrichment.
 * @returns {HTMLElement|null}        An HTML link if the check could be built, otherwise null.
 */
function enrichRoll( match, options ) {
  const rollCmd = match.groups.rollCmd.trim();
  if ( !parseRollCommand( rollCmd ) ) return null;

  const rollFlavor = match.groups.flavor?.trim() ?? "";
  const requestedTestType = match.groups.testType?.toLowerCase() ?? "arbitrary";
  const testType = requestedTestType === "damage" ? "effect" : requestedTestType;

  const textRollFormula = rollCmd.replace( /^\/s/i, _loc( "ED.Journal.TextEnricher.step" ) );
  const textTestType = testType === "arbitrary" ? "" : `${ROLLS.testTypes[testType].label}:\u00a0`;
  const rollElement = document.createElement( "a" );
  rollElement.className = "journal--roll strong";
  rollElement.dataset.rollCmd = rollCmd;
  rollElement.dataset.rollFlavor = rollFlavor;
  rollElement.dataset.testType = testType;
  rollElement.title = _loc( "X.Click to roll" );

  const icon = document.createElement( "i" );
  icon.className = "fas fa-regular fa-dice";
  rollElement.append( icon, `${textTestType}${textRollFormula}${rollFlavor ? `\u00a0${rollFlavor}` : ""}` );
  return rollElement;
}

/* -------------------------------------------- */

/**
 * Convert the leading step to dice and preserve the complete remaining expression.
 * @param {string} command The step command to parse.
 * @returns {{step: number, formula: string}|null} The numeric step and validated dice expression, or null.
 */
function parseRollCommand( command ) {
  const match = command.match( /^\/s\s*(?<step>\d+)(?<modifier>\s*(?:[+\-*/%][\s\S]*)?)$/i );
  if ( !match ) return null;

  const step = Number( match.groups.step );
  if ( !Number.isSafeInteger( step ) || step < 1 ) return null;

  try {
    const modifier = match.groups.modifier.trim();
    const formula = `(${getDice( step ).trim()})${modifier ? ` ${modifier}` : ""}`;
    return Roll.validate( formula ) ? { step, formula } : null;
  } catch {
    return null;
  }
}

/* -------------------------------------------- */

/**
 * Perform the provided roll action.
 * @param {Event} event     The click event triggering the action.
 * @returns {Promise|void} A Promise that resolves to the created ChatMessage, or undefined.
 */
async function rollAction( event ) {
  const target = event.target.closest( ".journal--roll" );
  if ( !target ) return;
  event.stopPropagation();

  const parsed = parseRollCommand( target.dataset.rollCmd );
  if ( !parsed ) return;

  const roll = new EdRoll(
    parsed.formula,
    {},
    new EdRollOptions( {
      step:       { base: parsed.step },
      chatFlavor: target.dataset.rollFlavor,
      testType:   target.dataset.testType,
    } )
  );

  return roll.toMessage();
}
