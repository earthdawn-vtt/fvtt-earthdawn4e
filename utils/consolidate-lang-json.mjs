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
 * @param {string} [langDir] The directory containing the JSON files. Defaults to "lang".
 * @param {[string]} [langFiles] An array of JSON file names. If not provided, all JSON files in the directory will be used.
 * @throws {TypeError} If langFiles is not an array.
 */
export default function consolidateLangJson( langDir, langFiles ) {

  // eslint-disable-next-line no-param-reassign
  langDir ??= path.resolve( "lang" );
  // eslint-disable-next-line no-param-reassign
  langFiles ??= fs.readdirSync( langDir ).filter(
    file => file.endsWith( ".json" )
  );
  if ( !Array.isArray( langFiles ) ) throw new TypeError( "langFiles must be an array" );

  const localizationPlaceholder = "TODO: Add translation";

  const langData = {};

  langFiles.forEach( file => {
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

  const allKeys = new Set(
    Object.values(
      flattenedLangs
    ).map(
      langObject => Object.keys( langObject )
    ).flat()
  );

  const resolvedLangs = {};

  for ( const file of Object.keys( flattenedLangs ) ) {
    resolvedLangs[file] = {};

    for ( const key of allKeys ) {
      const deValue = flattenedLangs["de.json"][key];
      const currentValue = flattenedLangs[file][key];

      if ( file === "de.json" ) {
        // Keep DE values as-is
        resolvedLangs[file][key] = deValue ?? localizationPlaceholder;
      } else if ( currentValue ) {
        // Keep existing non-empty value
        resolvedLangs[file][key] = currentValue;
      } else {
        // Default to placeholder
        resolvedLangs[file][key] = localizationPlaceholder;
      }
    }
  }

  for ( const file of Object.keys( resolvedLangs ) ) {
    const expanded = expandObject( resolvedLangs[file] );
    fs.writeFileSync( path.join( langDir, file ), JSON.stringify( expanded ), "utf8" );
  }
}