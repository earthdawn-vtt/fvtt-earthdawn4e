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

/* -------------------------------------------- */
/*  Define Module Structure                     */
/* -------------------------------------------- */

/**
 * Public Earthdawn 4th Edition system API exposed on {@link globalThis.ed4e}.
 *
 * This namespace contains links to the system's public modules, such as
 * applications, data models, documents, dice helpers, workflows, and utilities.
 * @category ed4e
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

/**
 * Global Earthdawn 4th Edition system namespace.
 * @global
 * @name ed4e
 * @type {typeof ed4e}
 * @category ed4e
 */
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

/* -------------------------------------------- */
/*  Hooks                                       */
/* -------------------------------------------- */

registerHooks();