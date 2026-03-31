import { getEdIds } from "../settings.mjs";
import { getAllEdIdsByType } from "../data/fields/edid-field.mjs";

/**
 *
 */
function populateAvailableEdIds() {
  const defaultEdIds = getEdIds();
  const edIds = getAllEdIdsByType( defaultEdIds );

  // in case this function gets called again, don't include "all" in "all"
  const edIdSets = Object.entries( edIds )
    .filter( ( [ key ] ) => key !== "all" )
    .map( ( [ , set ] ) => set );

  edIds.all = edIdSets.reduce( ( acc, edIdSet ) => {
    for ( const edId of edIdSet ) acc.add( edId );
    return acc;
  }, new Set() );

  game.ed4e.edIdsByType = edIds;
}

/**
 *
 */
export default function () {
  Hooks.once( "setup" , () => {
    populateAvailableEdIds();
  } );
}