import { sortObjectEntries } from "../utils/object.mjs";
import { LoggerEd } from "../logging/logger.mjs";

const logger = LoggerEd.getInstance();

/**
 * Storage for pre-localization configuration.
 * @type {object}
 * @private
 */
const _preLocalizationRegistrations = {};

/**
 * Mark the provided config key to be pre-localized during the init stage.
 * @param {string} configKeyPath          Key path within `CONFIG.ED4E` to localize.
 * @param {object} [options]              Additional options for pre-localization.
 * @param {string} [options.key]          If each entry in the config enum is an object,
 *                                        localize and sort using this property.
 * @param {string[]} [options.keys]    Array of localization keys. First key listed will be used for sorting
 *                                        if multiple are provided.
 * @param {boolean} [options.sort]  Sort this config enum, using the key if set.
 */
export function preLocalize( configKeyPath, { key, keys = [], sort = false } = {} ) {
  if ( key ) keys.unshift( key );
  _preLocalizationRegistrations[configKeyPath] = { keys, sort };
}

/**
 * Execute previously defined pre-localization tasks on the provided config object.
 * @param {object} config  The `CONFIG.ED4E` object to localize and sort. *Will be mutated.*
 */
export function performPreLocalization( config ) {
  for ( const [ keyPath, settings ] of Object.entries( _preLocalizationRegistrations ) ) {
    const target = foundry.utils.getProperty( config, keyPath );
    _localizeObject( target, settings.keys );
    if ( settings.sort ) foundry.utils.setProperty( config, keyPath, sortObjectEntries( target, settings.keys[0] ) );
  }
}

/**
 * Localize the values of a configuration object by translating them in-place.
 * @param {object} obj       The configuration object to localize.
 * @param {string[]} [keys]  List of inner keys that should be localized if this is an object.
 * @private
 */
function _localizeObject( obj, keys ) {
  for ( const [ k, v ] of Object.entries( obj ) ) {
    const type = typeof v;
    if ( type === "string" ) {
      obj[k] = _loc( v );
      continue;
    }

    if ( type !== "object" ) {
      logger.error( new Error(
        `Pre-localized configuration values must be a string or object, ${ type } found for "${ k }" instead.`
      ) );
      continue;
    }
    if ( !keys?.length ) {
      logger.error( new Error(
        "Localization keys must be provided for pre-localizing when target is an object."
      ) );
      continue;
    }

    for ( const key of keys ) {
      if ( !v[key] ) continue;
      v[key] = _loc( v[key] );
    }
  }
}