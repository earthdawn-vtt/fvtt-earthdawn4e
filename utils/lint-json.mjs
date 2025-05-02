import alignLangJson from "./format-lang-json.mjs";
import consolidateLangJson from "./consolidate-lang-json.mjs";
import fs from "fs";
import path from "path";
import process from "process";

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

/**
 * Validates if a filename follows ISO 639-1 code format (2-letter code + .json)
 * @param {string} filename The filename to validate
 * @returns {boolean} True if the filename follows ISO 639-1 format
 */
function isValidLanguageFile( filename ) {
  // ISO 639-1 codes are 2 letters followed by .json
  return /^[a-z]{2}\.json$/i.test( filename );
}

// Get files from command line arguments if any (for lint-staged integration)
const inputFiles = process.argv.slice( 2 ).filter( file => file.endsWith( ".json" ) );

// If called from lint-staged with files, ensure there's only one lang file
if ( inputFiles.length > 1 ) {
  console.error( "So nicht, Freundchen! Only one language file can be staged at a time." );
  process.exit( 1 );
}

const LANG_DIR = path.resolve( "lang" );
const files = fs.readdirSync( LANG_DIR ).filter(
  file => file.endsWith( ".json" )
);
const filePaths = files.map( file => path.join( LANG_DIR, file ) );

// Determine and validate the lead file
let leadFile;
if ( inputFiles.length === 1 ) {
  // Extract just the filename from the full path
  leadFile = path.basename( inputFiles[0] );
  
  // Validate that the lead file follows ISO 639-1 format
  if ( !isValidLanguageFile( leadFile ) ) {
    console.error( `Error: Language file "${leadFile}" does not follow ISO 639-1 format (2-letter code + .json)` );
    process.exit( 1 );
  }
  
  // Ensure the file exists in the lang directory
  if ( !files.includes( leadFile ) ) {
    console.error( `Error: Language file "${leadFile}" not found in ${LANG_DIR}` );
    process.exit( 1 );
  }
} else {
  // No file provided, throw an error
  console.error( "Error: No language file provided. Please specify a valid ISO 639-1 language file (.json)" );
  process.exit( 1 );
}

filePaths.forEach( file => validateJson( file ) );
consolidateLangJson( leadFile, LANG_DIR );
alignLangJson( filePaths );
filePaths.forEach( file => validateJson( file ) );