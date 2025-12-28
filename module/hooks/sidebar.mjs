/**
 *
 */
export default function () {
  Hooks.on( "renderSettings", ( app, html ) => {
    if ( app instanceof foundry.applications.sidebar.tabs.Settings ) {
      // Add buttons
      const changeLogButton = document.createElement( "button" );
      changeLogButton.id = "ed4eChangelog";
      changeLogButton.className = "changelog";
      changeLogButton.textContent = game.i18n.localize( "ED.Settings.SystemSupportOptions.changelog" );

      const helpButton = document.createElement( "button" );
      helpButton.id = "ed4eHelp";
      helpButton.className = "help";
      helpButton.textContent = game.i18n.localize( "ED.Settings.SystemSupportOptions.help" );

      const createBugButton = document.createElement( "button" );
      createBugButton.id = "ed4eTroubleshooting";
      createBugButton.className = "troubleshooter";
      createBugButton.textContent = game.i18n.localize( "ED.Settings.SystemSupportOptions.troubleshooting" );

      // Find the first element with the class "settings"
      const settingsElement = html.querySelector( ".settings" );
      if ( settingsElement ) {
        // Create the new sidebar container
        const sidebarDiv = document.createElement( "section" );
        sidebarDiv.className = "flexcol";
        sidebarDiv.id = "ed4e-sidebar";

        const title = document.createElement( "h4" );
        title.className = "divider"; // Add the "divider" class
        title.textContent = game.i18n.localize( "ED.Settings.SystemSupportOptions.title" );

        // Append title and buttons directly to the sidebar div
        sidebarDiv.appendChild( title );
        sidebarDiv.appendChild( changeLogButton );
        sidebarDiv.appendChild( helpButton );
        sidebarDiv.appendChild( createBugButton );

        // Insert the sidebar div after the settings element
        settingsElement.insertAdjacentElement( "afterend", sidebarDiv );

        // Add click event listeners
        changeLogButton.addEventListener( "click", () => {
          window.open( "https://github.com/patrickmohrmann/earthdawn4eV2/wiki/Change-Log", "_blank" );
        } );
        helpButton.addEventListener( "click", () => {
          window.open( "https://github.com/patrickmohrmann/earthdawn4eV2/wiki", "_blank" );
        } );
        createBugButton.addEventListener( "click", () => {
          window.open( "https://github.com/patrickmohrmann/earthdawn4eV2/issues/new?template=bug_report.md", "_blank" );
        } );
      }
    }
  } );
}