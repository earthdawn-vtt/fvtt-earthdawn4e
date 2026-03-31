/**
 * Converts the first letter of a string to lowercase.
 * @param { string } str The string to be modified.
 * @returns { string } The input string with its first letter converted to lowercase.
 */
export function lowerCaseFirstLetter( str ) {
  if ( !str || str.length === 0 ) return str;
  return str.charAt( 0 ).toLowerCase() + str.slice( 1 );
}