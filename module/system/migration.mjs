/**
 * System migration handler for Earthdawn 4e
 */

/**
 * Migration context to track issues and progress
 */
class MigrationContext {
  constructor( currentVersion, previousVersion ) {
    this.currentVersion = currentVersion;
    this.previousVersion = previousVersion;
    this.issues = [];
    this.warnings = [];
    this.successes = [];
    this.documentCount = 0;
    this.processedCount = 0;
  }

  /**
   * Add a migration issue
   * @param {string} severity - "error", "warning", or "info"
   * @param {string} type - Type of document/migration
   * @param {string} name - Name/ID of the problematic item
   * @param {string} message - Description of the issue
   * @param {object} [data] - Additional data for debugging
   */
  addIssue( severity, type, name, message, data = {} ) {
    const issue = {
      severity,
      type,
      name,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    switch ( severity ) {
      case "error":
        this.issues.push( issue );
        // console.error( `ED4e Migration | ${type} "${name}": ${message}`, data );
        break;
      case "warning":
        this.warnings.push( issue );
        // console.warn( `ED4e Migration | ${type} "${name}": ${message}`, data );
        break;
      case "info":
        this.successes.push( issue );
        // console.info( `ED4e Migration | ${type} "${name}": ${message}`, data );
        break;
    }
  }

  /**
   * Get summary statistics
   * @returns {object} Summary statistics object
   */
  getSummary() {
    return {
      total:     this.documentCount,
      processed: this.processedCount,
      errors:    this.issues.length,
      warnings:  this.warnings.length,
      successes: this.successes.length
    };
  }
}

/**
 * Global migration context - accessible from anywhere during migration
 */
let migrationContext = null;

/**
 * Get the current migration context
 * @returns {MigrationContext|null} The current migration context or null if not migrating
 */
export function getMigrationContext() {
  return migrationContext;
}

/**
 * Add an issue to the current migration context
 * @param {string} severity - "error", "warning", or "info"
 * @param {string} type - Type of document/migration
 * @param {string} name - Name/ID of the problematic item
 * @param {string} message - Description of the issue
 * @param {object} [data] - Additional data for debugging
 */
export function addMigrationIssue( severity, type, name, message, data = {} ) {
  if ( migrationContext ) {
    migrationContext.addIssue( severity, type, name, message, data );
  } else {
    // If no migration context available, log to console and store in a temporary array
    console.warn( "ED4e Migration | No migration context available for issue:", { severity, type, name, message, data } );
    
    // Store in a temporary array for later processing
    if ( !globalThis.ed4eMigrationIssues ) {
      globalThis.ed4eMigrationIssues = [];
    }
    globalThis.ed4eMigrationIssues.push( {
      severity,
      type,
      name,
      message,
      data,
      timestamp: new Date().toISOString()
    } );
    
    console.log( `ED4e Migration | Stored issue in temporary array. Total issues: ${globalThis.ed4eMigrationIssues.length}` );
  }
}

/**
 * Perform system-level migrations
 * @param {string} currentVersion - Current system version
 * @param {string} previousVersion - Previous system version  
 */
export async function migrateWorld( currentVersion, previousVersion ) {

  // Initialize migration context
  migrationContext = new MigrationContext( currentVersion, previousVersion );
  
  // Collect any issues that were logged before migration context was available
  if ( globalThis.ed4eMigrationIssues ) {
    for ( const issue of globalThis.ed4eMigrationIssues ) {
      migrationContext.addIssue( issue.severity, issue.type, issue.name, issue.message, issue.data );
    }
    // Clear the temporary storage
    delete globalThis.ed4eMigrationIssues;
  } 
  
  try {
    // Count total documents for progress tracking
    migrationContext.documentCount = game.actors.size + game.items.size;
    
    // Example: Create migration journal entry for version 0.8.3
    if ( foundry.utils.isNewerVersion( currentVersion, previousVersion ) ) {
      await runSpecificMigrations( currentVersion );
    }
    
    // Add more version-specific migrations here
    
    // Create the migration journal with all collected issues
    await createMigrationJournalEntry( migrationContext );
    
  } catch ( error ) {
    console.error( "ED4e Migration | Migration failed:", error );
    migrationContext.addIssue( "error", "System", "Migration", `Migration failed: ${error.message}` );
    await createMigrationJournalEntry( migrationContext );
  } finally {
    // Clear the global context
    migrationContext = null;
  }
}

/**
 * Run migrations specific to a version
 * @param {string} version - The version to migrate to
 */
async function runSpecificMigrations( version ) {
  // Process all items
  for ( const item of game.items ) {
    migrationContext.processedCount++;
    
    try {
      // Force re-migration by calling the data model's migration on the source data
      const sourceData = item.toObject();
      
      // Call the migrateData method to process the item
      item.system.constructor.migrateData( sourceData.system );
      
      // Log successful item migration
      migrationContext.addIssue( "info", "Item", item.name, `Successfully migrated ${item.type}`, { 
        itemId:   item.id, 
        itemType: item.type
      } );
      
    } catch ( error ) {
      migrationContext.addIssue( "error", "Item", item.name, `Failed to migrate: ${error.message}`, { 
        itemId:   item.id, 
        itemType: item.type,
        error:    error.stack 
      } );
    }
  }
  
  // Process all actors
  for ( const actor of game.actors ) {
    migrationContext.processedCount++;
    
    try {
      // Force re-migration by calling the data model's migration on the source data
      const sourceData = actor.toObject();
      
      // Call the migrateData method to process the actor
      actor.system.constructor.migrateData( sourceData.system );
      
      // Log successful actor migration
      migrationContext.addIssue( "info", "Actor", actor.name, `Successfully migrated ${actor.type}`, { 
        actorId:   actor.id, 
        actorType: actor.type
      } );
      
    } catch ( error ) {
      migrationContext.addIssue( "error", "Actor", actor.name, `Failed to migrate: ${error.message}`, { 
        actorId:   actor.id, 
        actorType: actor.type,
        error:     error.stack 
      } );
    }
  }
}

/**
 * Create a journal entry documenting the migration
 * @param {MigrationContext} context - The migration context with all issues
 */
async function createMigrationJournalEntry( context ) {
  const summary = context.getSummary();
  
  // Debug: log the summary before creating the journal
  console.log( "ED4e Migration | Final summary:", summary );
  console.log( "ED4e Migration | Issues breakdown:", {
    errors:    context.issues.length,
    warnings:  context.warnings.length,
    successes: context.successes.length
  } );
  
  // Create pages array starting with summary page
  const pages = [];
  
  // Summary page
  pages.push( {
    sort:  0,
    name:  "Migration Summary",
    type:  "text",
    title: { show: true, level: 1 },
    text:  {
      content: `
        <h1>Earthdawn 4e System Migration</h1>
        <p><strong>Migrated from:</strong> v${context.previousVersion}</p>
        <p><strong>Migrated to:</strong> v${context.currentVersion}</p>
        <p><strong>Migration Date:</strong> ${new Date().toLocaleString()}</p>
        
        <h2>Migration Summary</h2>
        <ul>
          <li><strong>Total Documents:</strong> ${summary.total}</li>
          <li><strong>Processed:</strong> ${summary.processed}</li>
          <li><strong>Errors:</strong> ${summary.errors}</li>
          <li><strong>Warnings:</strong> ${summary.warnings}</li>
          <li><strong>Successful:</strong> ${summary.successes}</li>
        </ul>
        
        ${summary.errors > 0 ? `<p><strong style="color: #d32f2f;">⚠️ ${summary.errors} errors found - check individual error pages for details</strong></p>` : ""}
        ${summary.warnings > 0 ? `<p><strong style="color: #f57c00;">⚠️ ${summary.warnings} warnings found - check warning pages for details</strong></p>` : ""}
        
        <h2>What to Check</h2>
        <p>Please review your:</p>
        <ul>
          <li>Character sheets</li>
          <li>Item configurations</li>
          <li>Macros and roll tables</li>
          ${summary.errors > 0 ? "<li><strong style=\"color: red;\">Items listed in the error pages</strong></li>" : ""}
        </ul>
      `
    }
  } );

  // Create individual pages for each error
  context.issues.forEach( ( issue, index ) => {
    pages.push( {
      sort:  1000 + index,
      name:  `Error ${index + 1}: ${issue.type} "${issue.name}"`,
      type:  "text",
      title: { show: true, level: 1 },
      text:  {
        content: `
          <h1 style="color: #d32f2f;">❌ Migration Error</h1>
          
          <h2>Error Details</h2>
          <ul>
            <li><strong>Type:</strong> ${issue.type}</li>
            <li><strong>Item:</strong> ${issue.name}</li>
            <li><strong>Timestamp:</strong> ${new Date( issue.timestamp ).toLocaleString()}</li>
          </ul>
          
          <h2>Error Message</h2>
          <div style="background: #ffebee; padding: 10px; border-left: 4px solid #d32f2f; margin: 10px 0;">
            <code>${issue.message}</code>
          </div>
          
          <h2>Debug Information</h2>
          <details>
            <summary><strong>Click to expand debug data</strong></summary>
            <pre style="background: #f5f5f5; padding: 10px; overflow-x: auto; font-size: 12px;">
${JSON.stringify( issue.data, null, 2 )}
            </pre>
          </details>
          
          <h2>Next Steps</h2>
          <p>This error needs to be investigated and fixed. Check:</p>
          <ul>
            <li>The item's data structure</li>
            <li>Any custom migration logic</li>
            <li>System compatibility issues</li>
          </ul>
        `
      }
    } );
  } );

  // Create individual pages for each warning
  context.warnings.forEach( ( warning, index ) => {
    pages.push( {
      sort:  2000 + index,
      name:  `Warning ${index + 1}: ${warning.type} "${warning.name}"`,
      type:  "text",
      title: { show: true, level: 1 },
      text:  {
        content: `
          <h1 style="color: #f57c00;">⚠️ Migration Warning</h1>
          
          <h2>Warning Details</h2>
          <ul>
            <li><strong>Type:</strong> ${warning.type}</li>
            <li><strong>Item:</strong> ${warning.name}</li>
            <li><strong>Timestamp:</strong> ${new Date( warning.timestamp ).toLocaleString()}</li>
          </ul>
          
          <h2>Warning Message</h2>
          <div style="background: #fff8e1; padding: 10px; border-left: 4px solid #f57c00; margin: 10px 0;">
            <code>${warning.message}</code>
          </div>
          
          <h2>Debug Information</h2>
          <details>
            <summary><strong>Click to expand debug data</strong></summary>
            <pre style="background: #f5f5f5; padding: 10px; overflow-x: auto; font-size: 12px;">
${JSON.stringify( warning.data, null, 2 )}
            </pre>
          </details>
          
          <h2>Recommendation</h2>
          <p>This warning indicates a potential issue that should be reviewed. The item may still function, but could have reduced functionality.</p>
        `
      }
    } );
  } );

  // Create a success summary page if there are many successes
  if ( context.successes.length > 0 ) {
    const buildSuccessList = () => {
      return context.successes.map( success => `
        <li><strong>${success.type}</strong> "${success.name}": ${success.message}</li>
      ` ).join( "" );
    };

    pages.push( {
      sort:  3000,
      name:  `Successful Migrations (${context.successes.length})`,
      type:  "text", 
      title: { show: true, level: 1 },
      text:  {
        content: `
          <h1 style="color: #388e3c;">✅ Successful Migrations</h1>
          
          <h2>Summary</h2>
          <p>${context.successes.length} items were successfully migrated without issues.</p>
          
          <h2>Details</h2>
          <ul>
            ${buildSuccessList()}
          </ul>
        `
      }
    } );
  }

  const journalData = {
    name:   `Migration to v${context.currentVersion}`,
    pages:  pages,
    folder: null,
    sort:   0,
    flags:  {
      "ed4e.migration": {
        version:   context.currentVersion,
        timestamp: Date.now(),
        summary:   summary
      }
    }
  };

  try {
    const journal = await JournalEntry.create( journalData );
    console.log( `ED4e | Created migration journal entry: ${journal.name} with ${pages.length} pages` );
    
    // Show the journal to GM if there were issues
    if ( game.user.isGM && ( summary.errors > 0 || summary.warnings > 0 ) ) {
      journal.sheet.render( true );
      ui.notifications.warn( `Migration completed with ${summary.errors} errors and ${summary.warnings} warnings. Check the migration journal for details.` );
    } else if ( game.user.isGM ) {
      ui.notifications.info( `Migration completed successfully! ${summary.processed} documents processed.` );
    }
  } catch ( error ) {
    console.error( "ED4e | Failed to create migration journal entry:", error );
  }
}
