import { resolvePath } from "./object.mjs";

/**
 * Computes the sum of the values in an array.
 * @param {Array<number>} arr An array of numbers.
 * @returns {number} The sum of the values in the array.
 */
export function sum( arr ) {
  return arr.reduce( ( partialSum, a ) => partialSum + a, 0 );
}

/**
 * Computes the sum of a specific property's values in an array of objects. The sum for only one property can be
 * calculated, and its name must be consistent across all objects in the array.
 * @param {Array<object>} arr   An array of numbers.
 * @param {string|symbol} prop  The name of the property that should be summed. Its values must be numerical.
 * @returns {number|undefined}  The sum of the property values in the array, or undefined if the values are not numeric.
 */
export function sumProperty( arr, prop ) {
  return /** @type { number } */ arr.reduce( ( partialSum, obj ) => partialSum + resolvePath( obj, prop ), 0 );
}

/**
 * Checks if a value is within a specified range.
 * @param {number} value - The value to check.
 * @param {number} min - The lower limit of the range.
 * @param {number} max - The upper limit of the range.
 * @param {boolean} [includeLimits] - Whether to include the limits in the range. If true, checks if the value is greater than or equal to min and less than or equal to max. If false, checks if the value is strictly greater or less than the limits.
 * @returns {boolean} Returns true if the value is within the range, and false otherwise.
 */
export function inRange( value, min, max, includeLimits = true ) {
  return includeLimits ? value >= min && value <= max : value > min && value < max;
}