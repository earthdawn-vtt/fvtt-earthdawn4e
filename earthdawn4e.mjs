/**
 * The Earthdawn 4e game system for Foundry Virtual Tabletop
 * A system for playing the fourth edition of the Earthdawn role-playing game.
 * Author: Patrick Mohrmann, Chris
 * Software License: MIT
 * Content License: ??
 * Repository: https://github.com/patrickmohrmann/earthdawn4eV2
 * Issue Tracker: https://github.com/patrickmohrmann/earthdawn4eV2/issues
 */

// Import configuration
import ED4E from "./module/config/_module.mjs";

// Import submodules
import * as applications from "./module/applications/_module.mjs";
import * as canvas from "./module/canvas/_module.mjs";
import * as data from "./module/data/_module.mjs";
import * as dice from "./module/dice/_module.mjs";
import * as documents from "./module/documents/_module.mjs";
import * as enrichers from "./module/enrichers.mjs";
import * as hooks from "./module/hooks/_module.mjs";
import * as system from "./module/system/_module.mjs";
import * as tours from "./module/tours/_module.mjs";
import * as utils from "./module/utils.mjs";
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