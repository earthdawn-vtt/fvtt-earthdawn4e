#!/usr/bin/env node

import fs from "fs";
import path from "path";
import fg from "fast-glob";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as core from "@actions/core";

/**
 * Finds missing localization keys by comparing code and language files
 */
class LocalizationChecker {

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
    
    // Results storage
    this.results = {
      missingInLang:  {},
      keysOnlyInLang: {},
      summary:        {
        totalKeysInCode: 0,
        totalKeysInLang: {},
        timestamp:       new Date().toISOString()
      }
    };
  }

  /**
   * Run the localization check
   */
  async run() {
    if ( LocalizationChecker.isGitHubActions ) {
      core.info( "Starting localization check in GitHub Actions environment" );
      core.startGroup( "Localization Check Process" );
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
        core.info( "Localization check completed successfully" );
      }
    } catch ( error ) {
      if ( LocalizationChecker.isGitHubActions ) {
        core.endGroup();
        core.setFailed( `Localization check failed: ${error.message}` );
      } else {
        console.error( "Error running localization checker:", error );
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
   * Format the results for storage
   * @param {Set<string>} keysInCode - All keys found in code
   * @returns {object} Formatted results object
   */
  formatResults( keysInCode ) {
    // Reset results
    this.results = {
      missingInLang:  {},
      keysOnlyInLang: {},
      summary:        {
        totalKeysInCode: keysInCode.size,
        totalKeysInLang: {},
        timestamp:       new Date().toISOString()
      }
    };
    
    // Check which keys are missing from language files
    for ( const [ langCode, langKeys ] of this.keysInLang.entries() ) {
      const missingKeys = [ ...keysInCode ].filter( key => !langKeys.has( key ) );
      
      this.results.summary.totalKeysInLang[langCode] = langKeys.size;
      
      if ( missingKeys.length > 0 ) {
        this.results.missingInLang[langCode] = missingKeys.sort().map( key => {
          const locations = this.keyLocations.get( key );
          const locationsArr = [ ...locations ].map( loc =>
            loc.replace( /\\/g, "/" ).replace( process.cwd().replace( /\\/g, "/" ) + "/", "" )
          );
          
          return {
            key,
            locations: locationsArr
          };
        } );
      }
    }
    
    // Find all keys that only exist in language files
    const keysOnlyInLang = new Set();
    
    // Collect all keys from all language files
    for ( const langKeys of this.keysInLang.values() ) {
      for ( const key of langKeys ) {
        if ( !keysInCode.has( key ) ) {
          keysOnlyInLang.add( key );
        }
      }
    }
    
    // For each key only in language files, record which lang files contain it
    for ( const key of keysOnlyInLang ) {
      this.results.keysOnlyInLang[key] = [];
      
      for ( const [ langCode, langKeys ] of this.keysInLang.entries() ) {
        if ( langKeys.has( key ) ) {
          this.results.keysOnlyInLang[key].push( langCode );
        }
      }
    }
    
    return this.results;
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
        core.setOutput( "missing_keys_count", 
          Object.values( this.results.missingInLang ).reduce( ( sum, arr ) => sum + arr.length, 0 )
        );
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
  
  /**
   * Report the results of the localization check
   */
  async reportResults() {
    console.log( "\n===== LOCALIZATION CHECK RESULTS =====\n" );
  
    const keysInCode = new Set( [ ...this.keysInJs, ...this.keysInTemplates ] );
    
    // Format results for saving to file
    this.formatResults( keysInCode );
    
    // Start GitHub summary if we're in GitHub Actions
    if ( LocalizationChecker.isGitHubActions ) {
      core.startGroup( "Localization Check Summary" );
      
      await core.summary
        .addHeading( "Localization Check Results", 1 )
        .addRaw( `_Generated on ${new Date().toISOString()}_`, true )
        .addEOL()
        .addRaw( `Total keys found in code: **${keysInCode.size}**`, true )
        .addEOL()
        .write();
    }
  
    // Check which keys are missing from language files
    for ( const [ langCode, langKeys ] of this.keysInLang.entries() ) {
      const missingInLang = [ ...keysInCode ].filter( key => !langKeys.has( key ) );
  
      if ( missingInLang.length > 0 ) {
        console.log( `\n🔍 Keys used in code but missing in ${ langCode }.json: ${ missingInLang.length }\n` );
        
        if ( LocalizationChecker.isGitHubActions ) {
          await this.writeToGitHubSummary( `## 🔍 Keys missing in ${langCode}.json: ${missingInLang.length}\n\n` );
          
          // Prepare table data
          const tableData = [
            // Header row
            [ { data: "Key", header: true }, { data: "Found In", header: true } ]
          ];
          
          missingInLang.sort().forEach( key => {
            const locations = this.keyLocations.get( key );
            const locationsArr = [ ...locations ].map( loc =>
              loc.replace( /\\/g, "/" ).replace( process.cwd().replace( /\\/g, "/" ) + "/", "" )
            );
            const locationsStr = locationsArr.join( ", " );
            
            core.info( `  "${ key }" - Found in: ${ locationsStr }` );
            
            // Create annotation for the first file where the key was found
            if ( locationsArr.length > 0 ) {
              this.outputGitHubAnnotation(
                "warning", 
                `Missing localization key: "${key}" (not found in ${langCode}.json)`,
                { file: locationsArr[0] }
              );
              
              // Add row to table data
              tableData.push( [ `\`${key}\``, locationsStr ] );
            }
          } );
          
          // Add table to summary
          await core.summary.addTable( tableData )
            .addEOL()
            .write();
        } else {
          missingInLang.sort().forEach( key => {
            const locations = this.keyLocations.get( key );
            const locationsArr = [ ...locations ].map( loc =>
              loc.replace( /\\/g, "/" ).replace( process.cwd().replace( /\\/g, "/" ) + "/", "" )
            );
            const locationsStr = locationsArr.join( ", " );
            
            console.log( `  "${ key }" - Found in: ${ locationsStr }` );
          } );
        }
      } else {
        console.log( `✅ All keys used in code are present in ${ langCode }.json.` );
        
        if ( LocalizationChecker.isGitHubActions ) {
          await core.summary
            .addHeading( `✅ All keys used in code are present in ${langCode}.json`, 2 )
            .addList( [
              `Total keys in ${langCode}.json: ${this.keysInLang.get( langCode ).size}`,
              `All ${keysInCode.size} code keys are present`,
              "Status: Complete"
            ] )
            .addEOL()
            .write();
        }
      }
    }
  
    // Check if there are keys in language files not used in code
    const keysOnlyInLang = Object.keys( this.results.keysOnlyInLang );
      
    if ( keysOnlyInLang.length > 0 ) {
      console.log( `\n⚠️ Keys present in language files but not found in code: ${ keysOnlyInLang.length }\n` );
      
      if ( LocalizationChecker.isGitHubActions ) {
        core.startGroup( "Unused localization keys" );
        
        await this.writeToGitHubSummary( `## ⚠️ Unused keys: ${keysOnlyInLang.length}\n\n` );
        await this.writeToGitHubSummary( "Keys present in language files but not found in code:\n\n" );
        
        // Prepare table data
        const tableData = [
          // Header row
          [ { data: "Key", header: true }, { data: "Found In Language Files", header: true } ]
        ];
        
        keysOnlyInLang.sort().forEach( key => {
          const langFiles = this.results.keysOnlyInLang[key].join( ", " );
          console.log( `  "${ key }" - Found in language files: ${ langFiles }` );
          
          // Add row to table data
          tableData.push( [ `\`${key}\``, langFiles ] );
        } );
        
        // Add table to summary
        await core.summary.addTable( tableData )
          .addEOL()
          .addSeparator()
          .write();
          
        core.endGroup();
      } else {
        keysOnlyInLang.sort().forEach( key => {
          const langFiles = this.results.keysOnlyInLang[key].join( ", " );
          console.log( `  "${ key }" - Found in language files: ${ langFiles }` );
        } );
      }
    } else {
      console.log( "✅ All keys in language files are used in code." );
      
      if ( LocalizationChecker.isGitHubActions ) {
        await this.writeToGitHubSummary( "## ✅ All keys in language files are used in code.\n\n" );
      }
    }

    console.log( "\n" );

    // Save results to file
    await this.saveResults();

    // Close the group if we're in GitHub Actions
    if ( LocalizationChecker.isGitHubActions ) {
      // Add final summary section with emoji status indicators
      await core.summary
        .addSeparator()
        .addHeading( "Summary Status", 2 )
        .addRaw( "✅ Check completed successfully", true )
        .addRaw( `📊 Total keys in code: **${keysInCode.size}**`, true )
        .addRaw( `⏱️ Execution time: **${( new Date() - this.startTime ) / 1000}s**`, true )
        .write();
      
      core.endGroup();
    }
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
  .option( "output-file", {
    alias:        "o",
    type:         "string",
    demandOption: false,
    description:  "Path to file where results will be saved",
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
  outputFile:   argv.outputFile,
  verbose:      argv.verbose
} );

checker.run()
  .catch( error => {
    console.error( "Error running localization checker:", error );
    process.exit( 1 );
  } );
