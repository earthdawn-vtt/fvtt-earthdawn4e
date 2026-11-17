/**
 * Test Instructions
 * Register the generic constraint input form tests for knack Items.
 */
import constraints from "./constraints.quench.mjs";

/**
 * Register the Item test batch.
 * @param {object} context The Quench test context.
 */
export default ( context ) => {
  constraints( context );
};
