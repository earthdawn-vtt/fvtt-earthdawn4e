import { SYSTEM_TYPES } from "./constants/constants.mjs";

// region Foundry

/**
 * Get all ED-IDs of all Items in the game world, optionally filtered by Item type.
 * @param {string} [type] - The type of Item to narrow the search by.
 * @returns {string[]} An array of all found ED-IDs.
 */
export function getAllEdIds( type ) {
  return Array.from( new Set(
    game.items.reduce( ( edids, item ) => {
      if ( !type || item.type === type ) edids.push( item.system.edid );
      return edids;
    }, [] )
  ) );
}

/**
 * Get all ED-IDs of all Items in the game world, grouped by Item type. Each type also has
 * all default ED-IDs.
 * @param {string[]} [defaultEdIds] - An array of default ED-IDs to include in all types.
 * @returns {Record<string, Set<string>>} An object where keys are Item types and values are sets of ED-IDs.
 */
export function getAllEdIdsByType( defaultEdIds = [] ) {
  const edIdsByType = {
    defaults: new Set( defaultEdIds ),
  };
  for ( const /** @type {ItemEd} */ item of game.items ) {
    if ( !edIdsByType[item.type] ) edIdsByType[item.type] = new Set( defaultEdIds );
    edIdsByType[item.type].add( item.system.edid );
  }
  return edIdsByType;
}

/**
 * Adapted from ({@link https://gitlab.com/peginc/swade/-/wikis/Savage-Worlds-ID|SWADE system}).
 * Returns an array of items that match a given EDID and optionally an item type.
 * Searched documents are world and compendium items.
 * @param {string} edid                    The EDID of the item(s) which you want to retrieve
 * @param {string} type                    Optionally, a type name to restrict the search
 * @returns {Promise<Item[]|undefined>}    An array containing the found items
 */
export async function getGlobalItemsByEdid( edid, type ) {
  return getAllDocuments(
    "Item",
    type,
    false,
    "OBSERVER",
    [ "system.edid" ],
    ( item ) => item.system.edid === edid,
  );
}

/**
 * Adapted from ({@link https://gitlab.com/peginc/swade/-/wikis/Savage-Worlds-ID|SWADE system}).
 * Fetch an item that matches a given EDID and optionally an item type.
 * Searched documents are world and compendium items.
 * @param {string} edid                  The EDID of the item(s) which you want to retrieve
 * @param {string} type                  Optionally, a type name to restrict the search
 * @returns {Promise<Item|undefined>}    The matching item, or undefined if none was found.
 */
export async function getSingleGlobalItemByEdid( edid, type ) {
  return getGlobalItemsByEdid( edid, type ).then( item => item[0] );
}

/**
 * Search all documents in the game, including world and packs, according to the
 * given constraints and return them in an array.
 *
 * Example usage:
 * ```
 * await ed4e.utils.getAllDocuments(
 * "Item",
 * SYSTEM_TYPES.Item.spell,
 * false,
 * ["system.level", "system.tier"],
 * x => ( x.system.level > 3 ) && ( x.system.binding === true )
 * )
 * ```
 * @param {string} documentName           The type of document that is searched
 *                                        for. One of `game.documentTypes` keys.
 * @param {string} documentType           The subtype for the chosen document
 *                                        type. One of the appropriate
 *                                        `game.documentTypes` values.
 * @param {boolean} asUuid                If `true`, return the found documents
 *                                        as just their UUIDs. Otherwise, the
 *                                        full documents are returned.
 * @param {DOCUMENT_OWNERSHIP_LEVELS} minOwnerRole The minimal ownership role
 *                                        the current user needs to get any
 *                                        document.
 * @param {[string]} filterFields         An array of document property keys that
 *                                        are used in the `predicate` function.
 *                                        Must contain all used keys.
 * @param {Function} predicateFunction    A function that can be used for
 *                                        pre-filtering the searched documents.
 *                                        Must be a function that takes one
 *                                        parameter, either the document (for
 *                                        world documents) or index (for packs).
 *                                        It must return `true` if the item
 *                                        should be kept, or `false` for it to
 *                                        be discarded.
 * @returns {Promise<[Document|string]>}   A promise that resolves to an array of
 *                                        either {@link Document}s or UUID
 *                                        strings of the found documents. Empty
 *                                        if no documents are found.
 */
// eslint-disable-next-line max-params
export async function getAllDocuments(
  documentName,
  documentType,
  asUuid = true,
  minOwnerRole = "OBSERVER",
  filterFields = [],
  predicateFunction
) {

  // Input checks

  const docTypes = game.documentTypes;

  if (
    !( documentName in docTypes )
    || ( documentType && !docTypes[documentName].includes( documentType ) )
  ) {
    console.error(
      `ED4E: Invalid documentName or documentType: ${documentName}, ${documentType}`
    );
    return [];
  }

  const predicate = predicateFunction ?? ( () => true );  // no filtering, take all items

  // Search documents

  const worldCollection = game.collections.get( documentName );
  const packs = game.packs.filter( p => p.documentName === documentName );

  const documents = worldCollection.filter(
    d =>
      ( !documentType || d.type === documentType )
      && d.testUserPermission( game.user, minOwnerRole )
  );
  const indices = await Promise.all(
    packs.map( async pack  => {
      if ( !pack.testUserPermission( game.user, minOwnerRole ) ) return [];
      const idx = await pack.getIndex( { fields: filterFields } );
      return  Array.from( idx.values() ).filter( i => i.type === documentType );
    } ),
  ).then( p => p.flat() );

  const allDocuments = [ ...documents, ...indices ].filter( predicate );

  return asUuid
    ? allDocuments.map( doc => doc.uuid )
    : Promise.all( allDocuments.map( doc => fromUuid( doc.uuid ) ) );

}

/**
 * Takes an array of documents and returns an object that can be used by Foundry's
 * {@link selectOptions} Handlebar helper as choices. The keys are a document's
 * UUID, the values it's name, which is rendered as representation in the HTML.
 * @param {foundry.abstract.Document[]} documents An array of documents that should
 * be the choices.
 * @returns {{}} An object in the form of the `choices` parameter of the
 * {@link selectOptions} Handlebar helper.
 */
export function documentsToSelectChoices( documents ) {
  return documents.reduce(
    ( obj, doc ) => ( { ...obj, [doc.uuid]: doc.name } ),
    {}
  );
}

/**
 * Creates a content link for a given UUID and description in the form:
 * `@UUID[uuid]{description}`. Can then be enriched by the Foundry API.
 * @param {string} uuid         The UUID of the linked entity.
 * @param {string} description  The description that is shown in the link.
 * @returns {string}            The content link in string representation.
 */
export function createContentLink( uuid, description ) {
  return `@UUID[${uuid}]{${description}}`;
}

/**
 * Creates an anchor element representing a content link for a given document.
 * @param {Document} document The document to link to.
 * @returns {Element} The anchor element with the "content-link" class.
 */
export function createContentAnchor( document ) {
  return foundry.applications.ux.TextEditor.createAnchor( {
    attrs:   {
      draggable: true,
    },
    dataset: {
      link:        document.link,
      uuid:        document.uuid,
      id:          document.id,
      type:        document.type,
      tooltip:     game.i18n.localize( `DOCUMENT.${document.documentName}` ),
      tooltipText: document.type,
    },
    classes: [ "content-link", ],
    name:    document.name,
    icon:    "fa-solid fa-suitcase",
  } );
}

/**
 * Prepare the final formula value for a model field.
 * @param {ItemDataModel} model  Model for which the value is being prepared.
 * @param {string} keyPath                        Path to the field within the model.
 * @param {string} label                          Label to use in preparation warnings.
 * @param {object} rollData                       Roll data to use when replacing formula values.
 */
export function prepareFormulaValue( model, keyPath, label, rollData ) {
  const value = foundry.utils.getProperty( model, keyPath );
  if ( !value ) return;
  const item = model.item ?? model.parent;
  const property = game.i18n.localize( label );
  try {
    const formula = replaceFormulaData( value, rollData, { item, property } );
    const roll = new Roll( formula );
    foundry.utils.setProperty( model, keyPath, roll.evaluateSync().total );
  } catch( err ) {
    if ( item.isEmbedded ) {
      const message = game.i18n.format( "ED.Notifications.Error.formulaMalformedError", { property, name: model.name ?? item.name } );
      // item.actor._preparationWarnings.push( { message, link: item.uuid, type: "error" } );
      console.error( message, err );
    }
  }
}

/**
 * Replace referenced data attributes in the roll formula with values from the provided data.
 * If the attribute is not found in the provided data, display a warning on the actor.
 * @param {string} formula           The original formula within which to replace.
 * @param {object} data              The data object which provides replacements.
 * @param {object} [options]         Options for the replacement process.
 * @param {ActorEd} [options.actor]            Actor for which the value is being prepared.
 * @param {ItemEd} [options.item]              Item for which the value is being prepared.
 * @param {string|null} [options.missing]  Value to use when replacing missing references, or `null` to not replace.
 * @param {string} [options.property]          Name of the property to which this formula belongs.
 * @returns {string}                 Formula with replaced data.
 */
export function replaceFormulaData( formula, data, { actor, item, missing="0", property }={} ) {
  const dataRgx = new RegExp( /@([a-z.0-9_-]+)/gi );
  const missingReferences = new Set();
  const newFormula = String( formula ).replace( dataRgx, ( match, term ) => {
    let value = foundry.utils.getProperty( data, term );
    if ( value === null || value === undefined ) {
      missingReferences.add( match );
      return missing ?? match[0];
    }
    return String( value ).trim();
  } );
  const newActor = actor ?? item?.parent;
  if ( ( missingReferences.size > 0 ) && newActor && property ) {
    const listFormatter = new Intl.ListFormat( game.i18n.lang, { style: "long", type: "conjunction" } );
    const message = game.i18n.format( "ED.Notifications.Error.formulaMissingReferenceWarn", {
      property, name: item?.name ?? newActor.name, references: listFormatter.format( missingReferences )
    } );
    newActor._preparationWarnings.push( { message, link: item?.uuid ?? newActor.uuid, type: "warning" } );
  }
  return newFormula;
}

/**
 * Create a unique id for a status condition.
 * @param {string} status     The primary status.
 * @returns {string}          A unique 16-character id.
 */
export function staticStatusId( status ) {
  if ( status.length >= 16 ) return status.substring( 0, 16 );
  return status.padEnd( 16, "0" );
}

// endregion

// region System

/**
 * Check whether the provided system type is valid for the given document type,
 * or in general if no document type is provided.
 * @param {string} systemType The system type to check.
 * @param {string} [documentType] The document type to check against.
 * @returns {boolean} True if the system type is valid, false otherwise.
 */
export function isValidSystemType( systemType, documentType ) {
  if ( documentType && !Object.keys( SYSTEM_TYPES ).includes( documentType ) ) return false;

  const validTypes = documentType
    ? Object.values( SYSTEM_TYPES[ documentType ] )
    : Object.values( SYSTEM_TYPES ).map(
      types => Object.values( types )
    ).flat();

  return validTypes.includes( systemType );
}

// endregion

// region View Helpers

/**
 * 
 * @param {*} ms milliseconds
 * @returns {*} milliseconds
 */
export async function delay( ms ) {
  return new Promise( resolve => {
    setTimeout( resolve, ms );
  } );

}

/**
 * Highlights an element by adding a CSS class for a short duration.
 * @param {HTMLElement} element The element to highlight.
 * @param {number} [duration] The duration in milliseconds for which the highlight should be visible.
 */
export function highlightElement( element, duration = 1500 ) {
  if ( !element ) return;
  element.classList.add( "highlight-flash" );
  setTimeout( () => {
    element.classList.remove( "highlight-flash" );
  }, duration );
}

// endregion

// region Maths

/**
 * Computes the sum of the values in array.
 * @param {Array<number>} arr An array of numbers.
 * @returns {number} The sum of the values in the array.
 */
export function sum( arr ) {
  return arr.reduce( ( partialSum, a ) => partialSum + a, 0 );
}

/**
 * Computes the sum of a specific property's  values in an array of objects. The sum for only one property can be
 * calculated, and its name must be consistent across all objects in the array.
 * @param {Array<object>} arr   An array of numbers.
 * @param {string|symbol} prop  The name of the property that should be summed. Its values must be numerical.
 * @returns {number|undefined}  The sum of the property values in the array, or undefined if the values are not numeric.
 */
export function sumProperty( arr, prop ) {
  return arr.reduce( ( partialSum, obj ) => partialSum + resolvePath( obj, prop ), 0 );
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

// endregion

// region Object Helpers

/**
 * Safely call a method if it exists on the object.
 * @param {object} obj - The object to check.
 * @param {string} methodName - The name of the method to call.
 * @param {...*} args - Arguments to pass to the method.
 * @returns {*} - The result of the method call, or undefined if the method does not exist.
 */
export function callIfExists( obj, methodName, ...args ) {
  if ( typeof obj[methodName] === "function" ) {
    return obj[methodName]( ...args );
  }
  return undefined;
}

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

/**
 * Creates a new array by repeating the provided array a specified number of times.
 * @param {Array} arr    The array to be repeated.
 * @param {number} times The number of times to repeat the array.
 * @returns {Array}      A new array with the repeated elements.
 * @throws {Error}       See `strict` option at {@link foundry.utils.deepClone} for details.
 * @example
 * multiplyArray( [1, 2, 3], 3 ) => [1, 2, 3, 1, 2, 3, 1, 2, 3]
 */
export function multiplyArray( arr, times ) {
  const clonedArray = foundry.utils.deepClone( arr, { strict: true } );
  return Array.from( { length: times }, () => clonedArray ).flat();
}

/**
 * Inserts an element into an array at the specified index. If the index is out of bounds,
 * the element is appended to the end of the array.
 * @param {Array} arr The array into which the element should be inserted. Will be mutated.
 * @param {any} element The element to insert into the array.
 * @param {number} [index] The index at which to insert the element. If -1 or omitted, the element is appended.
 * @returns {Array} The modified array with the new element inserted.
 */
export function arrayInsert( arr, element, index = -1 ) {
  if ( index < 0 || index >= arr.length ) {
    arr.push( element );
  } else {
    arr.splice( index, 0, element );
  }
  return arr;
}

/**
 * Creates an HTML document link for the provided UUID.
 * @param {string} uuid  UUID for which to produce the link.
 * @returns {Promise<HTMLAnchorElement>}     Link to the item or empty string if item wasn't found.
 */
export async function linkForUuid( uuid ) {
  return foundry.applications.ux.TextEditor.implementation._createContentLink( [ "", "UUID", uuid ] );
}

/**
 * Creates an HTML document link for the provided UUID.
 * @param {string} uuid  UUID for which to produce the link.
 * @returns {string}     Link to the item or empty string if item wasn't found.
 */
export function linkForUuidSync( uuid ) {
  const parsedUuid = foundry.utils.parseUuid( uuid );
  const doc = fromUuidSync( uuid, { strict: false } );
  const name = doc?.name ?? "";
  const packId = parsedUuid.collection?.metadata?.id ?? "";
  const tooltipType = game.i18n.localize(
    CONFIG[ parsedUuid.type ].typeLabels[ doc?.type ]
  );

  if ( !doc ) return `
    <a
      class="content-link broken"
      data-uuid="${uuid} "
      data-type="${parsedUuid.type}"
      data-tooltip="${tooltipType}"
      data-pack="${packId}"
    >
      <i class="fas fa-link-slash"></i>
      ${uuid}
    </a>`;

  return `
      <a 
        class="content-link" draggable="true" 
        data-link="" 
        data-uuid="${uuid}"
        data-id="${parsedUuid.id}"
        data-type="${parsedUuid.type}"
        data-tooltip="${tooltipType}"
        data-pack="${packId}"
      >
      <i class="fas fa-suitcase"></i>
      ${name}
    </a>`;
}

// endregion
