/**
 * Type Transformation Manager for handling document type transformations during migrations.
 * This manager coordinates type transformations from various source systems to the current ed4e system.
 * 
 * It provides a registry-based approach where different transformation modules can register:
 * - Simple type transformations (1:1 mappings)
 * - Complex type transformations (logic-based)
 * 
 * This manager is called by the MigrationManager but handles all type transformation logic separately.
 */
export default class TypeTransformationManager {

  /**
   * Registry of simple type transformation rules for cross-system migrations
   * @type {Map<string, Map<string, string>>}
   * @private
   */
  static #typeTransformRegistry = new Map();

  /**
   * Registry of complex type transformation handlers for different source systems
   * @type {Map<string, Function>}
   * @private
   */
  static #complexTypeTransformRegistry = new Map();

  /**
   * Register a simple type transformation rule for migrations
   * @param {string} sourceSystem - The source system identifier
   * @param {string} sourceType - The original type in the source system
   * @param {string} targetType - The target type in the ed4e system
   */
  static registerTypeTransform( sourceSystem, sourceType, targetType ) {
    if ( !this.#typeTransformRegistry.has( sourceSystem ) ) {
      this.#typeTransformRegistry.set( sourceSystem, new Map() );
    }
    this.#typeTransformRegistry.get( sourceSystem ).set( sourceType, targetType );
  }

  /**
   * Register a complex type transformation handler for a source system
   * @param {string} sourceSystem - The source system identifier
   * @param {Function} transformHandler - The transformation function that takes (source) and returns boolean
   */
  static registerComplexTypeTransform( sourceSystem, transformHandler ) {
    this.#complexTypeTransformRegistry.set( sourceSystem, transformHandler );
  }

  /**
   * Transform document type if needed for migration (simple transformations)
   * @param {object} source - The source document data (will be modified)
   * @param {string} sourceSystem - The detected source system
   * @returns {boolean} - True if type was transformed, false otherwise
   */
  static transformType( source, sourceSystem ) {
    const transformMap = this.#typeTransformRegistry.get( sourceSystem );
    if ( !transformMap || !source.type ) {
      return false;
    }

    const slugifiedType = source.type.slugify( { strict: true, lowercase: true } );
    const targetType = transformMap.get( slugifiedType );
    if ( targetType && targetType !== source.type ) {

      console.log( `MigrationManager: Type Transforming "${source.name || "Name-Not-Found-in-available-data"}" type "${source.type}" → "${targetType}" for system "${sourceSystem}"` );

      source.type = targetType;
      return true;
    }

    return false;
  }

  /**
   * Transform document type using complex logic for cases where simple mapping isn't sufficient
   * @param {object} source - The source document data (will be modified)
   * @param {string} sourceSystem - The detected source system
   * @returns {boolean} - True if type was transformed, false otherwise
   */
  static transformComplexType( source, sourceSystem ) {
    const transformHandler = this.#complexTypeTransformRegistry.get( sourceSystem );
    
    if ( !transformHandler ) {
      return false; // No complex transformation handler for this source system
    }

    try {
      return transformHandler( source );
    } catch ( error ) {
      if ( game.settings.get( "ed4e", "debug" ) === true ) {
        console.error( `TypeTransformationManager: Error in complex type transformation for ${sourceSystem}:`, error );
      }
      return false;
    }
  }

  /**
   * Apply all type transformations for a source document
   * This method coordinates both simple and complex transformations
   * @param {object} source - The source document data (will be modified)
   * @param {string} sourceSystem - The detected source system
   * @returns {boolean} - True if any transformation was applied, false otherwise
   */
  static transformAllTypes( source, sourceSystem ) {
    // First try simple type transformations
    const simpleTransformed = this.transformType( source, sourceSystem );
    
    // Then try complex type transformations that depend on system properties
    const complexTransformed = this.transformComplexType( source, sourceSystem );
    
    return simpleTransformed || complexTransformed;
  }

  /**
   * Get debugging information about registered transformations
   * @returns {object} - Debug information
   */
  static getDebugInfo() {
    const transforms = {};
    for ( const [ system, transformMap ] of this.#typeTransformRegistry ) {
      transforms[ system ] = Object.fromEntries( transformMap );
    }

    const complexTransforms = Array.from( this.#complexTypeTransformRegistry.keys() );

    return {
      typeTransforms:              transforms,
      complexTypeTransformSystems: complexTransforms
    };
  }

  /**
   * Clear all registered transformations (mainly for testing)
   */
  static clearAll() {
    this.#typeTransformRegistry.clear();
    this.#complexTypeTransformRegistry.clear();
  }
}
