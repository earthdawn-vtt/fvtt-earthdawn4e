import ED4E from "./config.mjs";
import EdRoll from "./dice/ed-roll.mjs";
import EdRollOptions from "./data/roll/common.mjs";
import getDice from "./dice/step-tables.mjs";

/**
 * Set up custom enrichers.
 */
export function registerCustomEnrichers() {
  CONFIG.TextEditor.enrichers.push(
    {
      pattern:  /@(?<type>roll)\(\s*(?<rollCmd>\/s\s*\d+(?:\s*\+\s*\d+)?)\s*\)(?:\((?<flavor>(?:[\u00C0-\u1FFF\u2C00-\uD7FF\w]+\s?)*)\))?(?:\((?<testType>action|effect|damage)\))?/gi,
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
 * @param {RegExpMatchArray} match   The regular expression match result.
 * @param {EnrichmentOptions} options  Options provided to customize text enrichment.
 * @returns {HTMLElement|null}   An HTML link if the check could be built, otherwise null.
 * @userFunction                UF_Journal-enrichRoll
 */
async function enrichRoll( match, options ) {

  const rollCmd = match.groups.rollCmd;
  const rollFlavor = match.groups.flavor;
  const testType = match.groups.testType ?? "arbitrary";

  const textRollFormula = rollCmd.replace(
    "/s",
    game.i18n.localize( "ED.General.step"
    ) );
  const textTestType = ( testType === "arbitrary" )
    ? ""
    : `${ED4E.testTypes[testType].label}:&nbsp;`;

  const rollElement = `
            <a class="journal--roll strong" data-roll-cmd="${rollCmd}" data-roll-flavor="${rollFlavor}" 
              data-test-type="${testType}" title="${game.i18n.localize( "X.Click to roll" )}">
              <i class="fas fa-regular fa-dice"></i>
              ${textTestType}${textRollFormula}&nbsp;${rollFlavor}
            </a>`;

  return $( rollElement )[0];
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

  // replace all whitespace in the roll formula
  const [ step, modifier ] = target.dataset.rollCmd.replaceAll( /\s*/g, "" ).replace( "/s", "" ).split( "+" );
  const formula = getDice( step ).trim();
  let roll; 
  
  roll = new EdRoll(
    `(${formula} ${modifier ? "+" : "" } ${modifier ?? "" })[${target.dataset.flavor}]`,
    {},
    new EdRollOptions( {
      step: {
        base: step,
      },
      chatFlavor: target.dataset.rollFlavor,
      testType:   target.dataset.testType,
    } )
  );
  
  

  return roll.toMessage();
}