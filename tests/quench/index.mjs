import * as suites from "./suites/_module.mjs";

/**
 * Register all Quench test batches.
 * @param quench
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
