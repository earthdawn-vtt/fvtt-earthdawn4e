/**
 * Register the `quenchReports` hook to produce a JSON report.
 *
 * Save the downloaded file as `tests/quench/reports/latest.xml` and commit it
 * to your PR branch so the CI workflow can verify all tests pass.
 */
export function registerQuenchReporter() {
  Hooks.on( "quenchReports", ( reports ) => {
    foundry.applications.api.DialogV2.confirm( {
      content: "Quench reports are ready. Download?",
    } ).then( ( shouldDownload ) => {
      if ( !shouldDownload ) return;
      try {
        foundry.utils.saveDataToFile( reports.json, "json", "latest.json" );
        ui.notifications?.info(
          "Quench report downloaded. Save it as tests/quench/reports/latest.json and commit before opening a PR."
        );
      } catch ( err ) {
        console.error( "ED4E | Failed to build Quench JUnit report:", err );
        ui.notifications?.error( "Failed to build Quench report. See console for details." );
      }
    } );
  } );
}
