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
  const packId = parsedUuid?.collection?.metadata?.id ?? "";
  const tooltipType = game.i18n.localize(
    CONFIG[parsedUuid?.type]?.typeLabels[doc?.type]
  );

  if ( !doc ) return `
    <a
      class="content-link broken"
      data-uuid="${ uuid } "
      data-type="${ parsedUuid?.type }"
      data-tooltip="${ tooltipType }"
      data-pack="${ packId }"
    >
      <i class="fas fa-link-slash"></i>
      ${ uuid }
    </a>`;

  return `
      <a 
        class="content-link" draggable="true" 
        data-link="" 
        data-uuid="${ uuid }"
        data-id="${ parsedUuid.id }"
        data-type="${ parsedUuid.type }"
        data-tooltip="${ tooltipType }"
        data-pack="${ packId }"
      >
      <i class="fas fa-suitcase"></i>
      ${ name }
    </a>`;
}