/**
 * Creates a content link for a given UUID and description in the form:
 * `@UUID[uuid]{description}`. Can then be enriched by the Foundry API.
 * @param {string} uuid         The UUID of the linked entity.
 * @param {string} description  The description that is shown in the link.
 * @returns {string}            The content link in string representation.
 */
export function createContentLink( uuid, description ) {
  return `@UUID[${ uuid }]{${ description }}`;
}

/**
 * Creates an anchor element representing a content link for a given document.
 * @param {Document} document The document to link to.
 * @returns {Element} The anchor element with the "content-link" class.
 */
export function createContentAnchor( document ) {
  return foundry.applications.ux.TextEditor.createAnchor( {
    attrs: {
      draggable: true
    },
    dataset: {
      link:        document.link,
      uuid:        document.uuid,
      id:          document.id,
      type:        document.type,
      tooltip:     game.i18n.localize( `DOCUMENT.${ document.documentName }` ),
      tooltipText: document.type
    },
    classes: [ "content-link" ],
    name:    document.name,
    icon:    "fa-solid fa-suitcase"
  } );
}