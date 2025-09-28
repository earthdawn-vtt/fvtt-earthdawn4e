export { default as EdImporter } from "./importer.mjs";

/**
 * Try to determine the document type from the provided data.
 * @param {object} data The data read from the imported JSON file.
 * @returns {string} The determined document type.
 * @throws {Error} If the document type is invalid or missing.
 */
export function determineDocumentType( data ) {
  let documentType = foundry.utils.parseUuid(
    data._stats?.exportSource?.uuid
  )?.type;

  if ( typeof documentType !== "string" || !CONST.WORLD_DOCUMENT_TYPES.includes( documentType ) ) {
    throw new Error( `Invalid or missing document type: ${ documentType }` );
  }

  return documentType;
}