import creation from "./creation.quench.mjs";
import characterGenerationName from "./character-generation-name.quench.mjs";
// import properties from "./properties.mjs";

/**
 * Actor test suite.
 * @param context
 */
export default ( context ) => {
  creation( context );
  characterGenerationName( context );
  // properties(context);
};
