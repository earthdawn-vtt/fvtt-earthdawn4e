// Import configuration
import ED4E from "./module/config/_module.mjs";

// Import submodules
import * as applications from "./module/applications/_module.mjs";
import * as canvas from "./module/canvas/_module.mjs";
import * as data from "./module/data/_module.mjs";
import * as dice from "./module/dice/_module.mjs";
import * as documents from "./module/documents/_module.mjs";
import * as enrichers from "./module/helpers/enrichers.mjs";
import * as hooks from "./module/hooks/_module.mjs";
import * as services from "./module/services/_module.mjs";
import * as system from "./module/system/_module.mjs";
import * as tours from "./module/tours/_module.mjs";
import * as utils from "./module/utils/_module.mjs";
import * as workflows from "./module/workflows/_module.mjs";

/* -------------------------------------------- */
/*  Define Module Structure                     */
/* -------------------------------------------- */

globalThis.ed4e = {
  applications,
  canvas,
  config: ED4E,
  data,
  dice,
  documents,
  enrichers,
  hooks,
  services,
  system,
  tours,
  utils,
  workflows,
};

/* -------------------------------------------- */
/*  Hooks                                       */
/* -------------------------------------------- */

system.registerHooks();


/* -------------------------------------------- */
/*  Bundled Module Exports                      */
/* -------------------------------------------- */

export {
  applications,
  canvas,
  data,
  dice,
  documents,
  enrichers,
  hooks,
  // migrations,
  system,
  utils,
  workflows,
  ED4E
};