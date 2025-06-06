import fs from "fs";
import path from "path";
import fg from "fast-glob";
import * as core from "@actions/core";

/**
 * Base class for localization checking functionality
 * Provides common methods used by both unused keys and missing keys checkers
 */
export default class LocalizationChecker {

  /**
   * @type {boolean} Whether the script is running in GitHub Actions
   */
  static isGitHubActions = Boolean( process.env.GITHUB_ACTIONS );

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
  hbsLocalizeRegex = /[{(]\s*localize\s+["']([a-zA-Z0-9_.-]+(?:\.[a-zA-Z0-9_.-]+)*)["']/g;

  /**
   * @type {RegExp} Regular expression to match any potential localization key pattern
   */
  potentialKeyRegex = /["']([A-Z]+(\.[a-zA-Z0-9_]+)+)["']/g;

  /**
   * Constructor
   * @param {object} options - Configuration options
   * @param {string} options.modulesDir - Directory containing *.mjs files
   * @param {string} options.templatesDir - Directory containing *.hbs files
   * @param {string} options.langDir - Directory containing language files
   * @param {string} options.outputFile - File to write results to
   * @param {boolean} options.verbose - Whether to output verbose information
   */
  constructor( { modulesDir, templatesDir, langDir, outputFile, verbose = false } ) {
    this.modulesDir = modulesDir;
    this.templatesDir = templatesDir;
    this.langDir = langDir;
    this.outputFile = outputFile;
    this.verbose = verbose;
    this.startTime = new Date();
    this.initializeResults();
  }

  /**
   * Initialize the results object - to be implemented by subclasses
   */
  initializeResults() {
    this.results = {
      summary: {
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Run the localization check
   */
  async run() {
    if ( LocalizationChecker.isGitHubActions ) {
      core.info( `Starting ${this.constructor.name} check in GitHub Actions environment` );
      core.startGroup( `${this.constructor.name} Process` );
    }

    try {
      // Collect all keys from code and language files
      await this.scanAllMjsFiles();
      await this.scanAllHbsFiles();
      await this.scanAllLangFiles();

      // Compare and report results
      await this.reportResults();

      if ( LocalizationChecker.isGitHubActions ) {
        core.endGroup();
        core.info( `${this.constructor.name} completed successfully` );
      }
    } catch ( error ) {
      if ( LocalizationChecker.isGitHubActions ) {
        core.endGroup();
        core.setFailed( `${this.constructor.name} failed: ${error.message}` );
      } else {
        console.error( `Error running ${this.constructor.name}:`, error );
      }
      throw error;
    }
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
      console.log( `Found ${ this.keysInTemplates.size } unique keys in *.hbs files.` );
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
   * Format the results for storage - to be implemented by subclasses
   */
  formatResults() {
    throw new Error( "Method 'formatResults' must be implemented by subclasses" );
  }

  /**
   * Report the results of the localization check - to be implemented by subclasses
   */
  async reportResults() {
    throw new Error( "Method 'reportResults' must be implemented by subclasses" );
  }

  /**
   * Ensures that a directory exists, creating it if necessary
   * @param {string} dirPath - Directory path to ensure
   * @returns {Promise<void>}
   */
  async ensureDirectoryExists( dirPath ) {
    try {
      await fs.promises.mkdir( dirPath, { recursive: true } );
    } catch ( error ) {
      if ( error.code !== "EEXIST" ) {
        throw error;
      }
    }
  }

  /**
   * Write content to GitHub step summary if running in GitHub Actions
   * @param {string} content - Markdown content to write
   * @returns {Promise<void>}
   */
  async writeToGitHubSummary( content ) {
    if ( !LocalizationChecker.isGitHubActions ) return;

    try {
      await core.summary.addRaw( content, true ).write();
    } catch ( error ) {
      console.error( "Error writing to GitHub summary:", error );
      core.error( `Failed to write to GitHub summary: ${error.message}` );
    }
  }

  /**
   * Output a GitHub workflow command annotation
   * @param {string} type - The annotation type: warning, error, notice, debug, info
   * @param {string} message - The message to display
   * @param {object} [options] - Optional properties for the annotation
   * @param {string} [options.file] - File path where the issue is found
   * @param {number} [options.line] - Line number where the issue is found
   * @param {number} [options.endLine] - End line number for multi-line annotations
   * @param {number} [options.column] - Column number
   * @param {number} [options.endColumn] - End column number
   */
  outputGitHubAnnotation( type, message, options = {} ) {
    if ( !LocalizationChecker.isGitHubActions ) return;

    const properties = { 
      file:        options.file, 
      startLine:   options.line,
      endLine:     options.endLine,
      startColumn: options.column,
      endColumn:   options.endColumn
    };

    switch ( type ) {
      case "error":
        core.error( message, properties );
        break;
      case "warning":
        core.warning( message, properties );
        break;
      case "debug":
        core.debug( message );
        break;
      case "info":
        core.info( message );
        break;
      case "notice":
      default:
        core.notice( message, properties );
    }
  }

  /**
   * Save results to the specified output file
   * @returns {Promise<void>}
   */
  async saveResults() {
    if ( !this.outputFile ) return;
    try {
      // Ensure the directory exists
      const outputDir = path.dirname( this.outputFile );
      await this.ensureDirectoryExists( outputDir );

      // Write the file
      await fs.promises.writeFile(
        this.outputFile,
        JSON.stringify( this.results, null, 2 ),
        "utf8"
      );

      const successMessage = `\n✅ Results saved to: ${this.outputFile}`;
      console.log( successMessage );

      if ( LocalizationChecker.isGitHubActions ) {
        core.info( successMessage );
        // Set output for potential downstream jobs
        core.setOutput( "results_file", this.outputFile );
      }
    } catch ( error ) {
      const errorMessage = `\n❌ Error saving results to ${this.outputFile}: ${error.message}`;
      console.error( errorMessage );

      if ( LocalizationChecker.isGitHubActions ) {
        core.error( errorMessage );
        core.setFailed( `Failed to save results: ${error.message}` );
      }
    }
  }
}
