import * as suites from "./suites/_module.mjs";
import { registerQuenchReporter } from "./reporter.mjs";

/**
 * Register all Quench test batches.
 * @param quench {Quench} The Quench instance.
 */
function registerBatches( quench ) {
  for ( const [ name, suite ] of Object.entries( suites ) ) {
    quench.registerBatch(
      `ed4e.${ name }`,
      ( context ) => suite( context ),
      {
        displayName: `ED4E: ${ name.charAt( 0 ).toUpperCase() + name.slice( 1 ) }`
      }
    );
  }
}

// Hook into Quench initialization
Hooks.once( "quenchReady", ( quench ) => {
  registerBatches( quench );
} );

// Generate a JUnit XML report after each batch run for CI consumption.
registerQuenchReporter();
