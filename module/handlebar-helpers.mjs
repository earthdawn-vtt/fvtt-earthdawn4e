import ED4E from "./config.mjs";
import getDice from "./dice/step-tables.mjs";
import { linkForUuidSync } from "./utils.mjs";

/**
 * @module handlebar-helpers - Provides custom Handlebars helpers for the application.
 */


/**
 * Checks if a collection has any items.
 * @param {any} collection - The collection to check.
 * @returns {boolean} - Returns true if the collection is not empty, false otherwise.
 */
function hasItems( collection ) {
  return !foundry.utils.isEmpty( collection );
}

/**
 * Adds two values together.
 * @param {number} value1 - The first value.
 * @param {number} value2 - The second value.
 * @returns {number} - The sum of the two values.
 */
function add( value1, value2 ) {
  return value1 + value2;
}

/**
 * Subtracts one value from another.
 * @param {number} value1 - The first value.
 * @param {number} value2 - The second value.
 * @returns {number} - The result of subtracting the second value from the first.
 */
function subtract( value1, value2 ) {
  return value1 - value2;
}

/**
 * Formats a number as a signed number.
 * @param {number} number - The number to format.
 * @returns {undefined|string} - The formatted number.
 */
function signedNumber( number ) {
  if ( number ) {
    return new Intl.NumberFormat(
      game.i18n.lang, { signDisplay: "exceptZero" }
    ).format( number ) ;
  } else {
    return undefined;
  }
}

/**
 * Returns the string "selected" if the value is truthy, otherwise returns an empty string.
 * @param {any} value - The value to check.
 * @returns {string} - "selected" if the value is truthy, otherwise an empty string.
 */
function selected( value ) {
  return value ? "selected" : "";
}

/**
 * @param {object} obj - The object to check.
 * @param {string} prop - The property name to check.
 * @function hasOwnProperty
 * @memberof Object.prototype
 * @returns {boolean} - Returns true if the object has the property, false otherwise.
 */
function hasOwnProperty( obj, prop ) {
  return obj.hasOwnProperty( prop );
}

/**
 * @see util.fromUuidSync
 * @param {string} uuid - The UUID to convert.
 * @returns {string} - The name of the entity with the given UUID.
 */
function nameFromUuid( uuid ) {
  return fromUuidSync( uuid , { strict: false } )?.name ?? "N/A";
}

/**
 * Retrieves the step for a given attribute value.
 * @param {number} attributeValue - The value of the attribute.
 * @returns {number} - The step value corresponding to the attribute value.
 */
function stepFromAttributeValue( attributeValue ) {
  return ED4E.characteristicsTable.step[attributeValue];
}

/**
 * Retrieves the talents that match a given category.
 * @param {Array[ItemEd]} talents - The talents to filter.
 * @param {string} type - The category to filter by.
 * @returns {Array[ItemEd]} - The talents that match the given category.
 */
function getTalentCategory( talents, type ) {
  return talents.filter( ( talent ) => talent.system.talentCategory === type );
}

/**
 * Converts an iterable to a comma-separated string.
 * @param {Iterable} iterable - The iterable to convert.
 * @returns {string} - A comma-separated string of the iterable's elements.
 */
function commaList( iterable ) {
  return Array.from( iterable ).join( "," );
}

/**
 * Checks if a collection includes a given element.
 * @param {Iterable} collection - The collection to check.
 * @param {any} element - The element to check for.
 * @returns {boolean} - Returns true if the collection includes the element, false otherwise.
 */
function includes( collection, element ) {
  return Array.from( collection ).includes( element );
}

/**
 * @description Creates an object that can be used in the {@link HandlebarsHelpers#formInput} helper as the
 * {@link FormInputConfig#dataset} parameter to create a tooltip.
 * @param {string} content - The content of the tooltip.
 * @returns {object} - An object with a tooltip property of the form `{ tooltip: content }`.
 */
function makeTooltip( content ) {
  return {
    tooltip: content,
  };
}

/**
 * Formats a javascript date to a locale string
 * @param {number} date The date as an integer as returned by {@link Date#now}.
 * @returns {string} The local formatted date string
 */
function formatDate( date ) {
  return Date( date ).toLocaleString();
}

/**
 * @description Registers custom Handlebars helpers for the application.
 */
export default function registerHandlebarHelpers() {

  Handlebars.registerHelper( {
    "ed-hasItems":               hasItems,
    "ed-add":                    add,
    "ed-subtract":               subtract,
    "ed-signedNumber":           signedNumber,
    "ed-selected":               selected,
    "ed-getProperty":            foundry.utils.getProperty,
    "ed-hasOwnProperty":         hasOwnProperty,
    "ed-nameFromUuid":           nameFromUuid,
    "ed-stepFromAttributeValue": stepFromAttributeValue,
    "ed-linkForUuid":            linkForUuidSync,
    "ed-diceFormulaForStep":     getDice,
    "ed-getTalentCategory":      getTalentCategory,
    "ed-commaList":              commaList,
    "ed-includes":               includes,
    "ed-makeTooltip":            makeTooltip,
    "ed-formatDate":             formatDate,
  } );

}
