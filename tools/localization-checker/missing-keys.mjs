import * as core from "@actions/core";
import LocalizationChecker from "./base.mjs";

/**
 * Finds missing localization keys by comparing code and language files
 */
export default class MissingLocalizationChecker extends LocalizationChecker {

  /**
   * Initialize the results object
   */
  initializeResults() {
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
   * Format the results for storage
   * @returns {object} Formatted results object
   */
  formatResults() {
    const keysInCode = new Set( [ ...this.keysInJs, ...this.keysInTemplates ] );

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
      // Filter keys that should be ignored
      const missingKeys = [ ...keysInCode ].filter( key => {
        // Skip keys if they don't exist in language files
        if ( !langKeys.has( key ) ) {
          // Ignore if the key ends with "."
          if ( key.endsWith( "." ) ) return false;

          // Ignore if last key part starts with capital letter
          const keyParts = key.split( "." );
          const lastPart = keyParts[keyParts.length - 1];
          if ( lastPart && lastPart[0] === lastPart[0].toUpperCase() && 
              lastPart[0] !== lastPart[0].toLowerCase() ) return false;

          // Ignore unused keys which are not starting with ED
          if ( !key.startsWith( "ED" ) ) return false;

          // Ignore unused keys which contain tabs
          if ( key.toLowerCase().includes( ".tabs." ) ) return false;

          // Ignore unused keys which contain Edid
          if ( key.toLowerCase().includes( ".edid." ) ) return false;

          return true;
        }
        return false;
      } );

      this.results.summary.totalKeysInLang[langCode] = langKeys.size;

      if ( missingKeys.length > 0 ) {
        this.results.missingInLang[langCode] = missingKeys.sort().map( key => {
          const locations = this.keyLocations.get( key );
          const locationsArr = [ ...locations ].map( loc =>
            loc.replace( /\\\\|\\/g, "/" ).replace( process.cwd().replace( /\\\\|\\/g, "/" ) + "/", "" )
          );

          return {
            key,
            locations: locationsArr
          };
        } );
      }
    }

    return this.results;
  }

  /**
   * Save results to the specified output file
   * @returns {Promise<void>}
   */
  async saveResults() {
    if ( !this.outputFile ) return;

    await super.saveResults();

    // Set additional output for GitHub Actions
    if ( LocalizationChecker.isGitHubActions ) {
      core.setOutput( "missing_keys_count", 
        Object.values( this.results.missingInLang ).reduce( ( sum, arr ) => sum + arr.length, 0 )
      );
    }
  }

  /**
   * Report the results of the localization check
   */
  async reportResults() {
    console.log( "\n===== LOCALIZATION CHECK RESULTS =====\n" );

    const keysInCode = new Set( [ ...this.keysInJs, ...this.keysInTemplates ] );

    // Format results for saving to file
    this.formatResults();

    // Start GitHub summary if we're in GitHub Actions
    if ( LocalizationChecker.isGitHubActions ) {
      core.startGroup( "Localization Check Summary" );

      await this.writeToGitHubSummary( "# Localization Check Results\n" );
      await this.writeToGitHubSummary( `<em>Generated on ${new Date().toISOString()}</em>\n\n` );
      await this.writeToGitHubSummary( `Total keys found in code: <strong>${keysInCode.size}</strong>\n\n` );
    }

    // Check which keys are missing from language files
    for ( const [ langCode, _ ] of this.keysInLang.entries() ) {
      const missingInLang = this.results.missingInLang[langCode] || [];

      if ( missingInLang.length > 0 ) {
        console.log( `\n🔍 Keys used in code but missing in ${ langCode }.json: ${ missingInLang.length }\n` );

        if ( LocalizationChecker.isGitHubActions ) {
          await this.writeToGitHubSummary( `## 🔍 Keys missing in ${langCode}.json: ${missingInLang.length}\n\n` );

          // Prepare table data
          const tableData = [
            // Header row
            [ { data: "Key", header: true }, { data: "Found In", header: true } ]
          ];

          missingInLang.forEach( entry => {
            const key = entry.key;
            const locationsStr = entry.locations.join( ", " );

            core.info( `  "${ key }" - Found in: ${ locationsStr }` );

            // Create annotation for the first file where the key was found
            if ( entry.locations.length > 0 ) {
              this.outputGitHubAnnotation(
                "warning", 
                `Missing localization key: "${key}" (not found in ${langCode}.json)`,
                { file: entry.locations[0] }
              );

              // Add row to table data
              tableData.push( [ `${key}`, locationsStr ] );
            }
          } );

          // Add table to summary
          await core.summary.addTable( tableData )
            .addEOL()
            .write();
        } else {
          missingInLang.forEach( entry => {
            const key = entry.key;
            const locationsStr = entry.locations.join( ", " );
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

    // Note about unused keys being in a separate script
    console.log( "\n⚠️ Check for unused keys in language files has been moved to a separate script: find-unused-lang-keys.mjs" );
    if ( LocalizationChecker.isGitHubActions ) {
      await this.writeToGitHubSummary( "\n## ⚠️ Unused Keys Check\n\nCheck for unused keys in language files has been moved to a separate script: find-unused-lang-keys.mjs\n" );
    }

    console.log( "\n" );

    // Save results to file
    await this.saveResults();

    // Close the group if we're in GitHub Actions
    if ( LocalizationChecker.isGitHubActions ) {
      // Add final summary section with emoji status indicators
      const hasMissingKeys = Object.values( this.results.missingInLang ).some( arr => arr.length > 0 );
      const statusEmoji = hasMissingKeys ? "⚠️" : "✅";
      const statusText = hasMissingKeys ? "Check completed with missing keys" : "Check completed successfully";

      await core.summary
        .addSeparator()
        .addHeading( "Summary Status", 2 )
        .addRaw( `${ statusEmoji } ${ statusText }`, true )
        .addRaw( `📊 Total keys in code: <strong>${ keysInCode.size }</strong>`, true )
        .addRaw( `⏱️ Execution time: <strong>${ ( new Date() - this.startTime ) / 1000 }s</strong>`, true )
        .write();

      core.endGroup();

      if ( hasMissingKeys ) {
        throw new Error( "Localization check found missing translation keys" );
      }
    }
  }
}
