import alignLangJson from "./format-lang-json.mjs";
import consolidateLangJson from "./consolidate-lang-json.mjs";
import fs from "fs";
import path from "path";


/**
 * Validate a JSON file.
 * @param {string} jsonFile The path to the JSON file to validate.
 * @throws {Error} If the JSON file is invalid.
 */
function validateJson( jsonFile ) {
  try {
    const jsonString = fs.readFileSync( jsonFile, "utf8" );
    JSON.parse( jsonString );
  } catch ( e ) {
    throw new Error( `Invalid JSON file: ${ jsonFile }`, { cause: e } );
  }
}

// Main script
const LANG_DIR = path.resolve( "lang" );
const files = fs.readdirSync( LANG_DIR ).filter(
  file => file.endsWith( ".json" )
);
const filePaths = files.map( file => path.join( LANG_DIR, file ) );


filePaths.forEach( file => validateJson( file ) );
consolidateLangJson( LANG_DIR, files );
alignLangJson( filePaths );
filePaths.forEach( file => validateJson( file ) );