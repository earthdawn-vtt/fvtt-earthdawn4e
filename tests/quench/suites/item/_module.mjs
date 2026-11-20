/**
 * Test Instructions
 * Register the workflow tests for editing mask items in the Quench Item batch.
 */

import maskPowers from "./mask-powers.quench.mjs";

/**
 * Registers the Item test batch.
 * @param {object} context The Quench test context.
 */
export default ( context ) => {
  maskPowers( context );
};
