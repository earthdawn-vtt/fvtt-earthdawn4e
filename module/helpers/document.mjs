import { SYSTEM_TYPES } from "../constants/constants.mjs";
import { LoggerEd } from "../logging/logger.mjs";

const logger = LoggerEd.getInstance();

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
    ( item ) => item.system.edid === edid
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
    logger.error(
      `ED4E: Invalid documentName or documentType: ${ documentName }, ${ documentType }`
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
    packs.map( async pack => {
      if ( !pack.testUserPermission( game.user, minOwnerRole ) ) return [];
      const idx = await pack.getIndex( { fields: filterFields } );
      return Array.from( idx.values() ).filter( i => i.type === documentType );
    } )
  ).then( p => p.flat() );

  const allDocuments = [ ...documents, ...indices ].filter( predicate );

  return asUuid
    ? allDocuments.map( doc => doc.uuid )
    : Promise.all( allDocuments.map( doc => fromUuid( doc.uuid ) ) );

}

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
    ? Object.values( SYSTEM_TYPES[documentType] )
    : Object.values( SYSTEM_TYPES ).map(
      types => Object.values( types )
    ).flat();

  return validTypes.includes( systemType );
}

/**
 * Create a unique id for a status condition.
 * @param {string} status     The primary status.
 * @returns {string}          A unique 16-character id.
 */
export function createStaticStatusId( status ) {
  if ( status.length >= 16 ) return status.substring( 0, 16 );
  return status.padEnd( 16, "0" );
}

/**
 * Prepares the object to add a {@link _del} to each of its keys, marking them for deletion.
 * @param {object} obj - The object whose keys are to be deleted.
 * @returns {object} A new object with values set to {@link _del}.
 */
export function prepareKeysForDeletion( obj ) {
  const renamedObj = {};
  for ( let key in obj ) {
    if ( obj.hasOwnProperty( key ) ) {
      renamedObj[ key ] = _del;
    }
  }
  return renamedObj;
}