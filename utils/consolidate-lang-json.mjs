import path from "path";
import fs from "fs";


/**
 * Expand a flat object with dot notation keys into a nested object.
 * @param {object} flatObj The object to expand
 * @returns {object} The expanded object
 */
export function expandObject( flatObj ) {
  const result = {};

  // eslint-disable-next-line guard-for-in
  for ( const flatKey in flatObj ) {
    const parts = flatKey.split( "." );
    let current = result;

    parts.forEach( ( part, idx ) => {
      if ( idx === parts.length - 1 ) {
        current[part] = flatObj[flatKey];
      } else {
        if ( !current[part] ) current[part] = {};
        current = current[part];
      }
    } );
  }

  return result;
}

/**
 * Flatten a possibly multidimensional object to a one-dimensional one by converting all nested keys to dot notation
 * @param {object} obj        The object to flatten
 * @param {number} [_d]     Track the recursion depth to prevent overflow
 * @returns {object}          A flattened object
 */
export function flattenObject( obj, _d=0 ) {
  const flat = {};
  if ( _d > 100 ) {
    throw new Error( "Maximum depth exceeded" );
  }
  for ( const [ k, v ] of Object.entries( obj ) ) {
    if ( typeof v === "object" ) {
      if ( !Object.keys( v ).length ) flat[k] = v;
      const inner = flattenObject( v, _d+1 );
      for ( const [ ik, iv ] of Object.entries( inner ) ) {
        flat[`${k}.${ik}`] = iv;
      }
    }
    else flat[k] = v;
  }
  return flat;
}


/**
 * Consolidate localization JSON files by ensuring all keys are present in each file.
 * @param {string} langFile The JSON file name to use as the lead. Required.
 * @param {string} [langDir] The directory containing the JSON files. Defaults to "lang".
 * @throws {TypeError} If langFile is not a string.
 */
export default function consolidateLangJson( langFile, langDir ) {

  if ( !langFile ) throw new TypeError( "langFile is required" );
  if ( typeof langFile !== "string" ) throw new TypeError( "langFile must be a string" );
  // eslint-disable-next-line no-param-reassign
  langDir ??= path.resolve( "lang" );

  const localizationPlaceholder = "TODO: Add translation";

  // Get all language files (including the lead file)
  const allLangFiles = fs.readdirSync( langDir ).filter(
    file => file.endsWith( ".json" )
  );
  
  const langData = {};
  
  // Load all language files
  allLangFiles.forEach( file => {
    const fullPath = path.join( langDir, file );
    const raw = fs.readFileSync( fullPath, "utf8" );
    langData[file] = {
      path:    fullPath,
      content: JSON.parse( raw )
    };
  } );

  const flattenedLangs = {};

  for ( const [ file, { content } ] of Object.entries( langData ) ) {
    flattenedLangs[file] = flattenObject( content );
  }

  // Create resolved languages object
  const resolvedLangs = {};

  // 1. Handle the lead file first
  resolvedLangs[langFile] = {};

  // Case 1.1: Keep all keys that exist in the lead file
  for ( const key of Object.keys( flattenedLangs[langFile] ) ) {
    resolvedLangs[langFile][key] = flattenedLangs[langFile][key];
  }

  // Store the lead keys for reference - these are the only valid keys
  const leadKeys = Object.keys( resolvedLangs[langFile] );

  // 2. Now process all other files
  for ( const file of Object.keys( flattenedLangs ).filter( f => f !== langFile ) ) {
    resolvedLangs[file] = {};

    // For each key in the lead file
    for ( const key of leadKeys ) {
      // const leadValue = flattenedLangs[langFile][key];
      const currentValue = flattenedLangs[file][key];

      // Case 2.1 & 2.2: Key exists in lead and exists in current
      if ( currentValue !== undefined ) {
        // In this implementation, we don't have access to whether the lead value has changed.
        // We can only see if the current values are different, which will always be the case
        // for translations. For now, we just keep the current value.
        resolvedLangs[file][key] = currentValue;
      }
      // Case 2.3: Key exists in lead but not in current
      else {
        // Add with placeholder
        resolvedLangs[file][key] = localizationPlaceholder;
      }
    }

    // Case 2.4: Keys that don't exist in lead but exist in current are not included
    // (handled automatically by only looping through lead keys)
  }

  for ( const file of Object.keys( resolvedLangs ) ) {
    const expanded = expandObject( resolvedLangs[file] );
    fs.writeFileSync( path.join( langDir, file ), JSON.stringify( expanded ), "utf8" );
  }
}