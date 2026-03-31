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