/**
 * Public API for the Earthdawn 4E Foundry VTT system.
 *
 * This module gathers the system's public submodules under the {@link ed4e}
 * namespace-like object and also exposes it on {@link globalThis}.
 * @module ed4e
 */


// Import configuration
import ED4E from "./module/config/_module.mjs";

// Import submodules
import * as applications from "./module/applications/_module.mjs";
import * as canvas from "./module/canvas/_module.mjs";
import * as data from "./module/data/_module.mjs";
import * as dice from "./module/dice/_module.mjs";
import * as documents from "./module/documents/_module.mjs";
import * as enrichers from "./module/helpers/enrichers.mjs";
import * as helpers from "./module/helpers/_module.mjs";
import * as hooks from "./module/hooks/_module.mjs";
import * as services from "./module/services/_module.mjs";
import * as tours from "./module/tours/_module.mjs";
import * as utils from "./module/utils/_module.mjs";
import * as workflows from "./module/workflows/_module.mjs";
import registerHooks from "./module/system/hooks.mjs";

// region Module Structure Definition

/**
 * The public Earthdawn 4E API namespace.
 *
 * This object mirrors the modules exposed on `globalThis.ed4e`.
 */
export const ed4e = {
  applications,
  canvas,
  config: ED4E,
  data,
  dice,
  documents,
  enrichers,
  helpers,
  hooks,
  services,
  tours,
  utils,
  workflows,
};

globalThis.ed4e = {
  applications,
  canvas,
  config: ED4E,
  data,
  dice,
  documents,
  enrichers,
  helpers,
  hooks,
  services,
  tours,
  utils,
  workflows,
};

// endregion

// region Hooks

registerHooks();

// endregion

// region Bundled Module Exports

export {
  applications,
  canvas,
  ED4E as config,
  data,
  dice,
  documents,
  enrichers,
  helpers,
  hooks,
  services,
  tours,
  utils,
  workflows,
};

// endregion