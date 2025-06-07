import * as core from "@actions/core";
import LocalizationChecker from "./base.mjs";

/**
 * Finds localization keys that exist in language files but not used in code
 */
export default class UnusedLocalizationChecker extends LocalizationChecker {

  /**
   * Initialize the results object
   */
  initializeResults() {
    this.results = {
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
      keysOnlyInLang: {},
      summary:        {
        totalKeysInCode: keysInCode.size,
        totalKeysInLang: {},
        timestamp:       new Date().toISOString()
      }
    };

    // Find all keys that only exist in language files
    const keysOnlyInLang = new Set();

    // Collect all keys from all language files
    for ( const [ langCode, langKeys ] of this.keysInLang.entries() ) {
      this.results.summary.totalKeysInLang[langCode] = langKeys.size;

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
   * Save results to the specified output file
   * @returns {Promise<void>}
   */
  async saveResults() {
    if ( !this.outputFile ) return;

    await super.saveResults();

    // Set additional output for GitHub Actions
    if ( LocalizationChecker.isGitHubActions ) {
      core.setOutput( "unused_keys_count", Object.keys( this.results.keysOnlyInLang ).length );
    }
  }

  /**
   * Report the results of the localization check
   */
  async reportResults() {
    console.log( "\n===== UNUSED LOCALIZATION KEYS CHECK RESULTS =====\n" );

    // Format results for saving to file
    this.formatResults();

    // Start GitHub summary if we're in GitHub Actions
    if ( LocalizationChecker.isGitHubActions ) {
      core.startGroup( "Unused Localization Keys Check Summary" );

      await this.writeToGitHubSummary( "# Unused Localization Keys Check Results\n" );
      await this.writeToGitHubSummary( `<em>Generated on ${new Date().toISOString()}</em>\n\n` );
      await this.writeToGitHubSummary( `Total keys found in code: <strong>${this.results.summary.totalKeysInCode}</strong>\n\n` );
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
          tableData.push( [ `${key}`, langFiles ] );
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
      const unusedKeysCount = Object.keys( this.results.keysOnlyInLang ).length;
      const statusEmoji = unusedKeysCount > 0 ? "⚠️" : "✅";
      const statusText = unusedKeysCount > 0 ? "Check completed with unused keys" : "Check completed successfully";

      await core.summary
        .addSeparator()
        .addHeading( "Summary Status", 2 )
        .addRaw( `${ statusEmoji } ${ statusText }`, true )
        .addRaw( `📊 Total keys in code: <strong>${ this.results.summary.totalKeysInCode }</strong>`, true )
        .addRaw( `⏱️ Execution time: <strong>${ ( new Date() - this.startTime ) / 1000 }s</strong>`, true )
        .write();

      core.endGroup();
    }
  }
}
