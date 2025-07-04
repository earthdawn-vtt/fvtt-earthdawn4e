import {performPreLocalization} from "../utils.mjs";
import registerSystemSettings from "../settings.mjs";
import * as data from "../data/_module.mjs";

/**
 *
 */
export default function () {
  Hooks.once( "i18nInit", () => {
    // Perform one-time pre-localization and sorting of some configuration objects
    performPreLocalization( CONFIG.ED4E );
    registerSystemSettings();

    _preLocalizeUntypedDataModels();
  } );
}

/**
 *
 */
function _preLocalizeUntypedDataModels() {
  const fUtils = foundry.utils;

  const untypedModels = Object.values(
    fUtils.flattenObject( data )
  ).filter( ( model ) => {
    return model.schema
      && !fUtils.isSubclass( model, foundry.abstract.TypeDataModel );
  } );

  for ( const model of untypedModels ) {
    foundry.helpers.Localization.localizeDataModel( model );
  }
}