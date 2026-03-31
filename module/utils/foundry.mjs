import { SYSTEM_TYPES } from "../constants/constants.mjs";

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