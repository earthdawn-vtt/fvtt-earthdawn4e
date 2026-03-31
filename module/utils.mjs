// region Object Helpers

/**
 * Sort the provided object by its values or by an inner sortKey.
 * @param {object} obj        The object to sort.
 * @param {string} [sortKey]  An inner key upon which to sort.
 * @returns {object}          A copy of the original object that has been sorted.
 */
export function sortObjectEntries( obj, sortKey ) {
  let sorted = Object.entries( obj );
  if ( sortKey ) sorted = sorted.sort( ( a, b ) => a[1][sortKey].localeCompare( b[1][sortKey] ) );
  else sorted = sorted.sort( ( a, b ) => a[1].localeCompare( b[1] ) );
  return Object.fromEntries( sorted );
}

/**
 * Filter an object's entries by the given predicate (filter function). Creates
 * a new object with only entries that satisfy the predicate.
 * @param {object} obj                            The object to filter.
 * @param {function(any, any): boolean} predicate A function that takes a key-value
 *                                                pair of the object and returns
 *                                                a boolean to decide whether the
 *                                                entry should be kept or discarded.
 *                                                Return `true` to keep the entry
 *                                                or `false` to discard it.
 * @returns {object} A new object with only the entries that satisfy the predicate.
 */
export function filterObject( obj, predicate ) {
  return Object.fromEntries(
    Object.entries( obj ).filter(
      ( [ key, value ] ) => predicate( key, value )
    )
  );
}

/**
 * Map an object's entries by the given function. Creates a new object with the
 * mapped entries according to the function.
 * @param {object} obj                The object to filter.
 * @param {Function} mappingFunction  A function that takes a key-value pair of
 *                                    the object and return the new mapped
 *                                    key-value pair. It takes two parameters
 *                                    `[key, value]` and must return them as
 *                                    `[key, value]`.
 * @returns {object}                  A new object with the mapped entries.
 */
export function mapObject( obj, mappingFunction ) {
  return Object.fromEntries(
    Object.entries( obj ).map(
      ( [ key, value ] ) => mappingFunction( key, value )
    )
  );
}

/**
 * Renames all keys of an object by prepending a specified prefix to each key.
 * @param {object} obj - The object whose keys are to be renamed.
 * @returns {object} A new object with keys renamed with the specified prefix.
 */
export function renameKeysWithPrefix( obj ) {
  const renamedObj = {};
  for ( let key in obj ) {
    if ( obj.hasOwnProperty( key ) ) {
      renamedObj["-=" + key] = null;
    }
  }
  return renamedObj;
}

/**
 * Retrieves the value of a given string property of an object which works for nested property names.
 * Taken from {@link https://stackoverflow.com/a/43849204 this answer on StackOverflow}.
 * @example
 * const myVar = {
 *  a: { b: [ { c:1 } ] }
 * }
 * resolvePath(myVar,'a.b[0].c') => 1
 * resolvePath(myVar,'a["b"][\'0\'].c') => 1
 * @param {object} object     The object to access.
 * @param {string} path       The path of the property to be accessed. If nested, must be separated by `.` a period. If
 *                            an array, must use bracket notation.
 * @param {any} defaultValue  The value to return if the given key does not exist in the `object`.
 * @returns {any}             The value of the given key in the object.
 */
export function resolvePath( object, path, defaultValue ){
  return path.split( "." ).reduce( ( o, p ) => o ? o[p] : defaultValue, object );
}

// endregion
