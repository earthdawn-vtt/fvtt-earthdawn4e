/**
 *
 */
export async function cleanup() {}

/**
 * Deletes the specified documents by invoking their `delete` method.
 * @param {...foundry.abstract.Document} documents - A list of documents to be deleted.
 *                                Each document must have a `delete` method.
 *                                Falsy values will be ignored.
 * @returns {Promise<void>} A promise that resolves when all specified documents have been successfully deleted.
 */
export async function deleteDocuments( ...documents ) {
  for ( const document of documents.filter( Boolean ) ) {
    await document.delete();
  }
}