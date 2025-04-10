#!/usr/bin/env node

import fs from "fs";
import path from "path";


/**
 * Format a lang file JSON object into a string with aligned keys and values.
 * @param {object} obj The object to format. All keys and values must be strings.
 * @param {number} [indentSize] The number of spaces to use for indentation.
 * @returns {string} The formatted JSON string.
 */
function formatAligned( obj, indentSize = 2 ) {
  let maxKeyWidth = 0;

  /**
   * Recursively collect printable entries with depth info.
   * @param {object} obj The object to collect entries from.
   * @param {number} level The current indentation level.
   * @returns {[]} An array of entries with their type, key, indent, and value.
   */
  function collect( obj, level = 0 ) {
    const entries = [];
    const sortedKeys = Object.keys( obj ).sort();

    for ( const key of sortedKeys ) {
      const value = obj[key];
      const indent = " ".repeat( ( level + 1 ) * indentSize );
      const fullKey = `${indent}"${key}"`;
      maxKeyWidth = Math.max( maxKeyWidth, fullKey.length );

      if ( typeof value === "object" && value !== null && !Array.isArray( value ) ) {
        const children = collect( value, level + 1 );
        entries.push( { type: "object", key, indent, children, level } );
      } else {
        entries.push( { type: "primitive", key, indent, value, level } );
      }
    }

    return entries;
  }

  /**
   * Format entries into aligned JSON.
   * @param { [[str][str]][]} entries The entries of an object to format.
   * @param {number} level The current indentation level.
   * @returns {string} The formatted JSON string.
   */
  function formatEntries( entries, level = 0 ) {
    const output = [];

    entries.forEach( ( entry, idx ) => {
      const isLast = idx === entries.length - 1;

      if ( entry.type === "primitive" ) {
        const fullKey = `${entry.indent}"${entry.key}"`;
        const padding = " ".repeat( maxKeyWidth - fullKey.length );
        const formattedValue = JSON.stringify( entry.value ); // handles strings, numbers, null, etc.
        output.push( `${fullKey}:${padding} ${formattedValue}${isLast ? "" : ","}` );
      }

      if ( entry.type === "object" ) {
        const fullKey = `${entry.indent}"${entry.key}"`;
        output.push( `${fullKey}: {` );
        output.push( ...formatEntries( entry.children, entry.level + 1 ) );
        const closingIndent = " ".repeat( ( entry.level + 1 ) * indentSize );
        output.push( `${closingIndent}}${isLast ? "" : ","}` );
      }
    } );

    return output;
  }

  // Build formatted lines and return full string
  const collected = collect( obj );
  const bodyLines = formatEntries( collected );
  return [ "{", ...bodyLines, "}" ].join( "\n" );
}

/**
 * Format a JSON file with aligned keys and values and write it back in place.
 * @param {string} filePath The path to the JSON file to format.
 * @returns {void}
 * @throws {SyntaxError} If the JSON file is not valid.
 */
function formatLangFile( filePath ) {
  const fileContent = fs.readFileSync( filePath, "utf8" );
  const parsedContent = JSON.parse( fileContent );
  const formattedContent = formatAligned( parsedContent );
  try {
    JSON.parse( formattedContent );
  } catch ( e ) {
    console.error( `Error parsing formatted content: ${ e.message }` );
    return;
  }
  fs.writeFileSync( filePath, formattedContent + "\n", "utf8" );
}


// Main function
if ( process.argv.length < 3 ) {
  console.error( "Usage: node format-json.js <file1.json> <file2.json> ..." );
  process.exit( 1 );
}

const files = process.argv.slice( 2 );

if ( files.length === 0 ) {
  console.error( "No files provided." );
  process.exit( 1 );
}
files.forEach( ( file ) => {
  const filePath = path.resolve( file );

  if ( !file.endsWith( ".json" ) ) {
    console.error( `Invalid file type: ${ filePath }` );
    return;
  }

  if ( !fs.existsSync( filePath ) ) {
    console.error( `File not found: ${ filePath }` );
  }

  formatLangFile( filePath );
  console.log( `Formatted ${ filePath }` );
} );