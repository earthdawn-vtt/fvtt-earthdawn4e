#!/usr/bin/env node

import fs from "fs";
import path from "path";
import fg from "fast-glob";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

/**
 * Finds missing localization keys by comparing code and language files
 */
class LocalizationChecker {

  /**
   * @type {Set<string>} Set of all keys found in *.mjs files
   */
  keysInJs = new Set();

  /**
   * @type {Set<string>} Set of all keys found in *.hbs files
   */
  keysInTemplates = new Set();

  /**
   * @type {Map<string, Set<string>>} Map of all keys found in language files
   */
  keysInLang = new Map();

  /**
   * @type {Map<string, Set<string>>} Map of file paths to keys found in each file
   */
  keyLocations = new Map();

  /**
   * @type {RegExp} Regular expression to match localization keys in *.mjs files
   */
  mjsLocalizeRegex = /(?:localize|format)\(\s*["']([a-zA-Z0-9_.-]+(?:\.[a-zA-Z0-9_.-]+)*)["']/g;

  /**
   * @type {RegExp} Regular expression to match localization keys in *.hbs files
   */
  hbsLocalizeRegex = /[{(]\s*localize\s+((["']([a-zA-Z0-9_.-]+(?:\.[a-zA-Z0-9_.-]+)*)["'])|([a-zA-Z0-9_]+))/g;

  /**
   * @type {RegExp} Regular expression to match any potential localization key pattern
   */
  potentialKeyRegex = /["']([a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)+)["']/g;

  /**
   * Constructor
   * @param {object} options - Configuration options
   * @param {string} options.modulesDir - Directory containing *.mjs files
   * @param {string} options.templatesDir - Directory containing *.hbs files
   * @param {string} options.langDir - Directory containing language files
   * @param {boolean} options.verbose - Whether to output verbose information
   */
  constructor( { modulesDir, templatesDir, langDir, verbose = false } ) {
    this.modulesDir = modulesDir;
    this.templatesDir = templatesDir;
    this.langDir = langDir;
    this.verbose = verbose;
  }

  /**
   * Run the localization check
   */
  async run() {
    // Collect all keys from code and language files
    await this.scanAllMjsFiles();
    await this.scanAllHbsFiles();
    await this.scanAllLangFiles();

    // Compare and report results
    this.reportResults();
  }

  /**
   * Scan all *.mjs files for localization keys
   */
  async scanAllMjsFiles() {
    console.log( "Scanning *.mjs files for localization keys..." );

    const fileStream = await fg.globStream( [ `${ this.modulesDir }/**/*.mjs` ], { onlyFiles: true } );

    for await ( const file of fileStream ) {
      try {
        const content = await fs.promises.readFile( file, { encoding: "utf8" } );
        this.scanMjsContent( file, content );
      } catch ( error ) {
        console.error( `Error scanning file ${ file }:`, error );
      }
    }

    if ( this.verbose ) {
      console.log( `Found ${ this.keysInJs.size } unique keys in *.mjs files.` );
    }
  }

  /**
   * Scan all *.hbs files for localization keys
   */
  async scanAllHbsFiles() {
    console.log( "Scanning *.hbs files for localization keys..." );

    const fileStream = await fg.globStream( [ `${ this.templatesDir }/**/*.hbs` ], { onlyFiles: true } );

    for await ( const file of fileStream ) {
      try {
        const content = fs.readFileSync( file, "utf8" );
        this.scanHbsContent( file, content );
      } catch ( error ) {
        console.error( `Error scanning file ${ file }:`, error );
      }
    }

    if ( this.verbose ) {
      console.log( `Found ${ this.keysInTemplates.size } unique keys in all code files.` );
    }
  }

  /**
   * Scan all language files for localization keys
   */
  async scanAllLangFiles() {
    console.log( "Scanning language files..." );

    const fileStream = await fg.globStream( [ `${ this.langDir }/*.json` ], { onlyFiles: true } );

    for await ( const file of fileStream ) {
      try {
        const content = fs.readFileSync( file, "utf8" );
        const langCode = path.basename( file, ".json" );
        const keys = new Set();
        this.keysInLang.set( langCode, keys );

        try {
          const langData = JSON.parse( content );
          this.extractKeysFromLangObject( langData, "", keys );
        } catch ( jsonError ) {
          console.error( `Error parsing JSON in ${ file }:`, jsonError );
        }

        if ( this.verbose ) {
          console.log( `Found ${ keys.size } keys in ${ langCode }.json.` );
        }
      } catch ( error ) {
        console.error( `Error scanning file ${ file }:`, error );
      }
    }
  }

  /**
   * Extract all keys from a language file
   * @param {object} obj - The language object
   * @param {string} prefix - Current key prefix
   * @param {Set<string>} result - Set to collect keys into
   */
  extractKeysFromLangObject( obj, prefix, result ) {
    for ( const [ key, value ] of Object.entries( obj ) ) {
      const newKey = prefix ? `${ prefix }.${ key }` : key;

      if ( typeof value === "object" && value !== null ) {
        this.extractKeysFromLangObject( value, newKey, result );
      } else {
        result.add( newKey );
      }
    }
  }

  /**
   * Scan an MJS file content for localization keys
   * @param {string} filePath - Path to the file
   * @param {string} content - File content
   */
  scanMjsContent( filePath, content ) {
    let match;

    // Find keys from localize/format functions
    while ( ( match = this.mjsLocalizeRegex.exec( content ) ) !== null ) {
      const key = match[1];
      this.keysInJs.add( key );
      this.recordKeyLocation( filePath, key );
    }

    // Find potential keys
    while ( ( match = this.potentialKeyRegex.exec( content ) ) !== null ) {
      const key = match[1];
      this.keysInJs.add( key );
      this.recordKeyLocation( filePath, key );
    }
  }

  /**
   * Scan an HBS file content for localization keys
   * @param {string} filePath - Path to the file
   * @param {string} content - File content
   */
  scanHbsContent( filePath, content ) {
    let match;

    // Find keys from localize helper
    while ( ( match = this.hbsLocalizeRegex.exec( content ) ) !== null ) {
      const key = match[1];
      this.keysInTemplates.add( key );
      this.recordKeyLocation( filePath, key );
    }
  }

  /**
   * Record the location where a key was found
   * @param {string} filePath - Path to the file
   * @param {string} key - The localization key
   */
  recordKeyLocation( filePath, key ) {
    if ( !this.keyLocations.has( key ) ) {
      this.keyLocations.set( key, new Set() );
    }
    this.keyLocations.get( key ).add( filePath );
  }

  /**
   * Report the results of the localization check
   */
  reportResults() {
    console.log( "\n===== LOCALIZATION CHECK RESULTS =====\n" );

    const keysInCode = new Set( [ ...this.keysInJs, ...this.keysInTemplates ] );

    // Check which keys are missing from language files
    for ( const [ langCode, langKeys ] of this.keysInLang.entries() ) {
      const missingInLang = [ ...keysInCode ].filter( key => !langKeys.has( key ) );

      if ( missingInLang.length > 0 ) {
        console.log( `\n🔍 Keys used in code but missing in ${ langCode }.json: ${ missingInLang.length }\n` );

        missingInLang.sort().forEach( key => {
          const locations = this.keyLocations.get( key );
          const locationsStr = [ ...locations ].map( loc =>
            loc.replace( /\\/g, "/" ).replace( process.cwd().replace( /\\/g, "/" ) + "/", "" )
          ).join( ", " );

          console.log( `  "${ key }" - Found in: ${ locationsStr }` );
        } );
      } else {
        console.log( `✅ All keys used in code are present in ${ langCode }.json.` );
      }
    }

    // Check if there are keys in language files not used in code
    const baseKeys = this.keysInLang.has( "en" )
      ? this.keysInLang.get( "en" )
      : this.keysInLang.values().next().value;

    if ( baseKeys ) {
      const unusedKeys = [ ...baseKeys ].filter( key => !keysInCode.has( key ) );

      if ( unusedKeys.length > 0 ) {
        console.log( `\n⚠️ Keys present in language files but not found in code: ${ unusedKeys.length }\n` );
        unusedKeys.sort().forEach( key => {
          console.log( `  "${ key }"` );
        } );
      } else {
        console.log( "✅ All keys in language files are used in code." );
      }
    }

    console.log( "\n" );
  }
}

// Parse command line arguments
const argv = yargs( hideBin( process.argv ) )
  .usage( "$0 [args]" )
  .option( "module-dir", {
    alias:       "m",
    type:        "string",
    description: "Directory containing *.mjs files",
    default:     "module"
  } )
  .option( "templates-dir", {
    alias:       "t",
    type:        "string",
    description: "Directory containing *.hbs files",
    default:     "templates"
  } )
  .option( "lang-dir", {
    alias:       "l",
    type:        "string",
    description: "Directory containing language files",
    default:     "lang"
  } )
  .option( "verbose", {
    alias:       "v",
    type:        "boolean",
    description: "Output verbose information",
    default:     false
  } )
  .help()
  .parse();

// Run the localization checker
const checker = new LocalizationChecker( {
  modulesDir:   argv.moduleDir,
  templatesDir: argv.templatesDir,
  langDir:      argv.langDir,
  verbose:      argv.verbose
} );

checker.run()
  .catch( error => {
    console.error( "Error running localization checker:", error );
    process.exit( 1 );
  } );
