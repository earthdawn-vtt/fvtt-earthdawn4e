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
    this.todos = [];
    this.successes = [];
    this.documentCount = 0;
    this.processedCount = 0;
  }

  /**
   * Add a migration issue
   * @param {string} severity - "error", "warning", "todo", or "info"
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
      case "todo":
        this.todos.push( issue );
        // console.info( `ED4e Migration | TODO ${type} "${name}": ${message}`, data );
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
      todos:     this.todos.length,
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
 * @param {string} severity - "error", "warning", "todo", or "info"
 * @param {string} type - Type of document/migration
 * @param {string} name - Name/ID of the problematic item
 * @param {string} message - Description of the issue
 * @param {object} [data] - Additional data for debugging
 */
export function addMigrationIssue( severity, type, name, message, data = {} ) {
  // reason for this if/else function:
  // 1. Foundry starts loading world
  // 2. Documents load → migrateData() called → addMigrationIssue() called
  // 3. But migrationContext is still null!
  // 4. Later: migrateWorld() runs and creates migrationContext
  // 5. Need to collect all those "early" migration issues
  if ( migrationContext ) {
    migrationContext.addIssue( severity, type, name, message, data );
  } else {
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
    
    // Validate that successfully migrated items still exist before creating journal
    await validateMigrationIssues( migrationContext );
    
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
 * Create a journal entry documenting the migration
 * @param {MigrationContext} context - The migration context with all issues
 */
async function createMigrationJournalEntry( context ) {
  const summary = context.getSummary();
  
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
          <li><strong>TODOs:</strong> ${summary.todos}</li>
          <li><strong>Successful:</strong> ${summary.successes}</li>
        </ul>
        
        ${summary.errors > 0 ? `<p><strong style="color: #d32f2f;">⚠️ ${summary.errors} errors found - check individual error pages for details</strong></p>` : ""}
        ${summary.warnings > 0 ? `<p><strong style="color: #f57c00;">⚠️ ${summary.warnings} warnings found - check warning pages for details</strong></p>` : ""}
        ${summary.todos > 0 ? `<p><strong style="color: #1976d2;">📋 ${summary.todos} items require your attention - check TODO pages for details</strong></p>` : ""}
        
        <h2>What to Check</h2>
        <p>Please review your:</p>
        <ul>
          <li>Actor sheets</li>
          <li>Item sheets</li>
          ${summary.errors > 0 ? "<li><strong style=\"color: red;\">Items listed in the error pages</strong></li>" : ""}
        </ul>
      `
    }
  } );

  // Create individual pages for each error
  context.issues.forEach( ( issue, index ) => {
    // Enhance the message with clickable links if possible
    const enhancedMessage = enhanceMessageWithLinks( issue );
    
    pages.push( {
      sort:  1000 + index,
      name:  `Error ${index + 1}: "${issue.name}" (${issue.type})`,
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
            <code>${enhancedMessage}</code>
          </div>
          
          <h2>Debug Information</h2>
          <details>
            <summary><strong>Click to expand debug data</strong></summary>
            <pre style="background: #f5f5f5; padding: 10px; overflow-x: auto; font-size: 12px;">
${JSON.stringify( issue.data, null, 2 )}
            </pre>
          </details>
        `
      }
    } );
  } );

  // Create individual pages for each warning
  context.warnings.forEach( ( warning, index ) => {
    // Enhance the message with clickable links if possible
    const enhancedMessage = enhanceMessageWithLinks( warning );
    
    pages.push( {
      sort:  2000 + index,
      name:  `Warning ${index + 1}: "${warning.name}" (${warning.type})`,
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
            <code>${enhancedMessage}</code>
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

  // Create individual pages for each TODO item
  context.todos.forEach( ( todo, index ) => {
    // Enhance the message with clickable links if possible
    const enhancedMessage = enhanceMessageWithLinks( todo );
    
    pages.push( {
      sort:  2500 + index,
      name:  `TODO ${index + 1}: "${todo.name}" (${todo.type})`,
      type:  "text",
      title: { show: true, level: 1 },
      text:  {
        content: `
          <h1 style="color: #1976d2;">📋 Action Required</h1>
          
          <h2>Item Details</h2>
          <ul>
            <li><strong>Type:</strong> ${todo.type}</li>
            <li><strong>Item:</strong> ${todo.name}</li>
            <li><strong>Timestamp:</strong> ${new Date( todo.timestamp ).toLocaleString()}</li>
          </ul>
          
          <h2>What You Need To Do</h2>
          <div style="background: #e3f2fd; padding: 15px; border-left: 4px solid #1976d2; margin: 10px 0;">
            <strong>📋 Action Required:</strong><br>
            ${enhancedMessage}
          </div>
          
          <h2>Debug Information</h2>
          <details>
            <summary><strong>Click to expand debug data</strong></summary>
            <pre style="background: #f5f5f5; padding: 10px; overflow-x: auto; font-size: 12px;">
${JSON.stringify( todo.data, null, 2 )}
            </pre>
          </details>
        `
      }
    } );
  } );

  // Create a success summary page if there are many successes
  if ( context.successes.length > 0 ) {
    const buildSuccessList = () => {
      return context.successes.map( success => `
        <li><strong>"${success.name}"</strong> (${success.type}): ${success.message}</li>
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
    if ( game.user.isGM && ( summary.errors > 0 || summary.warnings > 0 || summary.todos > 0 ) ) {
      journal.sheet.render( true );
      const messages = [];
      if ( summary.errors > 0 ) messages.push( `${summary.errors} errors` );
      if ( summary.warnings > 0 ) messages.push( `${summary.warnings} warnings` );
      if ( summary.todos > 0 ) messages.push( `${summary.todos} items requiring attention` );
      ui.notifications.warn( `Migration completed with ${messages.join( ", " )}. Check the migration journal for details.` );
    } else if ( game.user.isGM ) {
      ui.notifications.info( `Migration completed successfully! ${summary.processed} documents processed.` );
    }
  } catch ( error ) {
    console.error( "ED4e | Failed to create migration journal entry:", error );
  }
}

/**
 * Utility function to find an item by name and type
 * @param {string} name - The name of the item to find
 * @param {string} type - The type of the item to find
 * @returns {boolean} - True if an item with the given name and type exists
 */
function findItemByNameAndType( name, type ) {
  // Check world items
  const worldItem = game.items.find( item => item.name === name && item.type === type );
  if ( worldItem ) return true;
  
  // Check items in all actors
  for ( const actor of game.actors ) {
    const actorItem = actor.items.find( item => item.name === name && item.type === type );
    if ( actorItem ) return true;
  }
  
  return false;
}

/**
 * Validate that items reported as successfully migrated still exist
 * Remove success reports for items that were later deleted during migration
 * @param {MigrationContext} context - The migration context to validate
 */
/**
 * Check if an item or actor still exists
 * @param {object} issue - The migration issue to validate
 * @returns {boolean} - True if the item/actor still exists
 */
function checkItemStillExists( issue ) {
  const itemData = issue.data;
  
  // Check if this is an actor-related issue
  if ( issue.type === "Actor" ) {
    // Check if the actor still exists
    if ( itemData.actorId ) {
      const actor = game.actors.get( itemData.actorId );
      return !!actor;
    } else {
      // Fallback to name-based search (less reliable)
      return !!game.actors.find( actor => actor.name === issue.name );
    }
  }
  // Check if this is an item-related issue
  else if ( issue.type === "Knack" || issue.type === "Item" || issue.type === "knackAbility" || issue.type === "knackKarma" || issue.type === "knackManeuver" ) {
    // If we have both actor and item IDs, this is an embedded item
    if ( itemData.actorId && itemData.itemId ) {
      // Check if the specific actor still has this specific item
      const actor = game.actors.get( itemData.actorId );
      if ( actor ) {
        const item = actor.items.get( itemData.itemId );
        return !!item;
      } else {
        return false;
      }
    } 
    // If we only have item ID, this is a world item
    else if ( itemData.itemId ) {
      // World item - check if it still exists in world items
      const item = game.items.get( itemData.itemId );
      return !!item;
    } 
    // Fallback to name-based search (less reliable)
    else {
      return findItemByNameAndType( issue.name, itemData.itemType || issue.type );
    }
  }
  
  // If we can't determine, assume it still exists
  return true;
}

/**
 * Validate that items reported in migration issues still exist
 * Remove reports for items that were later deleted during migration
 * @param {MigrationContext} context - The migration context to validate
 */
async function validateMigrationIssues( context ) {
  const validSuccesses = [];
  const validTodos = [];
  
  // Validate success entries
  for ( const success of context.successes ) {
    if ( checkItemStillExists( success ) ) {
      validSuccesses.push( success );
    } else {
      console.log( `ED4e Migration | Removing success report for deleted ${success.type.toLowerCase()}: ${success.name}` );
    }
  }
  
  // Validate TODO entries
  for ( const todo of context.todos ) {
    if ( checkItemStillExists( todo ) ) {
      validTodos.push( todo );
    } else {
      console.log( `ED4e Migration | Removing TODO for deleted ${todo.type.toLowerCase()}: ${todo.name}` );
    }
  }
  
  // Replace the arrays with only valid ones
  context.successes = validSuccesses;
  context.todos = validTodos;
  
  // Note: We don't validate errors or warnings since they should remain 
  // even if the item was deleted, as they provide important information about what happened
}

/**
 * Enhance a migration issue message with clickable links to the relevant item/actor
 * @param {object} issue - The migration issue object
 * @returns {string} - Enhanced message with clickable links
 */
function enhanceMessageWithLinks( issue ) {
  let enhancedMessage = issue.message;
  const itemData = issue.data;
  
  // Try to find the actual document and create a link
  let linkHtml = "";
  
  // If we have both actor and item IDs, this is an embedded item
  if ( itemData.actorId && itemData.itemId ) {
    const actor = game.actors.get( itemData.actorId );
    if ( actor ) {
      const item = actor.items.get( itemData.itemId );
      if ( item ) {
        linkHtml = `@UUID[Actor.${actor.id}.Item.${item.id}]{${item.name}} on @UUID[Actor.${actor.id}]{${actor.name}}`;
      }
    }
  } 
  // If we only have item ID, this is a world item
  else if ( itemData.itemId ) {
    const item = game.items.get( itemData.itemId );
    if ( item ) {
      linkHtml = `@UUID[Item.${item.id}]{${item.name}}`;
    }
  }
  // If we only have actor ID, this is an actor
  else if ( itemData.actorId ) {
    const actor = game.actors.get( itemData.actorId );
    if ( actor ) {
      linkHtml = `@UUID[Actor.${actor.id}]{${actor.name}}`;
    }
  }
  
  // If we found a document, enhance the message with a link
  if ( linkHtml ) {
    enhancedMessage += `<br><br><strong>🔗 Quick Access:</strong> Click here to open ${linkHtml}`;
  }
  
  return enhancedMessage;
}