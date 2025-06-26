/**
 * System migration handler for Earthdawn 4e
 */

/**
 * Perform system-level migrations
 * @param {string} currentVersion - Current system version
 * @param {string} previousVersion - Previous system version  
 */
export async function migrateWorld( currentVersion, previousVersion ) {
  console.log( `ED4e | Migrating system from ${previousVersion} to ${currentVersion}` );
  
  // Example: Create migration journal entry for version 0.8.3
  if ( foundry.utils.isNewerVersion( "0.8.3", previousVersion ) ) {
    await createMigrationJournalEntry( "0.8.3", previousVersion );
  }
  
  // Add more version-specific migrations here
}

/**
 * Create a journal entry documenting the migration
 * @param {string} newVersion - The version being migrated to
 * @param {string} oldVersion - The version being migrated from
 */
async function createMigrationJournalEntry( newVersion, oldVersion ) {
  const journalData = {
    name:  `Migration to v${newVersion}`,
    pages: [ {
      sort:  100000,
      name:  "Migration Summary",
      type:  "text",
      title: { show: true, level: 1 },
      text:  {
        content: `
          <h1>Earthdawn 4e System Migration</h1>
          <p><strong>Migrated from:</strong> v${oldVersion}</p>
          <p><strong>Migrated to:</strong> v${newVersion}</p>
          <p><strong>Migration Date:</strong> ${new Date().toLocaleString()}</p>
          
          <h2>Changes Made</h2>
          <ul>
            <li>Data structure updates</li>
            <li>Document migrations</li>
            <li>Configuration changes</li>
          </ul>
          
          <h2>What to Check</h2>
          <p>Please review your:</p>
          <ul>
            <li>Character sheets</li>
            <li>Item configurations</li>
            <li>Macros and roll tables</li>
          </ul>
        `
      }
    } ],
    folder: null,
    sort:   0,
    flags:  {
      "ed4e.migration": {
        version:   newVersion,
        timestamp: Date.now()
      }
    }
  };

  try {
    const journal = await JournalEntry.create( journalData );
    console.log( `ED4e | Created migration journal entry: ${journal.name}` );
    
    // Optionally show the journal to GM
    if ( game.user.isGM ) {
      journal.sheet.render( true );
    }
  } catch ( error ) {
    console.error( "ED4e | Failed to create migration journal entry:", error );
  }
}
