/** @module config */

import * as ACTIONS from "./actions.mjs";
import * as ACTORS from "./actors.mjs";
import * as CHAT from "./chat.mjs";
import * as COMBAT from "./combat.mjs";
import * as DOCUMENT_DATA from "./document-data.mjs";
import * as EFFECTS from "./effects.mjs";
import * as ENVIRONMENT from "./environment.mjs";
import * as ITEMS from "./items.mjs";
import * as LEGEND from "./legend.mjs";
import * as MAGIC from "./magic.mjs";
import * as QUANTITIES from "./quantities.mjs";
import * as ROLLS from "./rolls.mjs";
import * as SOCKETS from "./sockets.mjs";
import * as STATUSES from "./statuses.mjs";
import * as SYSTEM from "./system.mjs";
import * as TOKEN from "./token.mjs";
import * as MIGRATIONS from "./migrations.mjs";
import * as WORKFLOWS from "./workflows.mjs";

export * from "./actions.mjs";
export * from "./actors.mjs";
export * from "./chat.mjs";
export * from "./combat.mjs";
export * from "./document-data.mjs";
export * from "./effects.mjs";
export * from "./environment.mjs";
export * from "./items.mjs";
export * from "./legend.mjs";
export * from "./magic.mjs";
export * from "./quantities.mjs";
export * from "./rolls.mjs";
export * from "./sockets.mjs";
export * from "./statuses.mjs";
export * from "./system.mjs";
export * from "./token.mjs";
export * from "./migrations.mjs";
export * from "./workflows.mjs";

/** @ignore */
export {
  ACTIONS,
  ACTORS,
  CHAT,
  COMBAT,
  DOCUMENT_DATA,
  EFFECTS,
  ENVIRONMENT,
  ITEMS,
  LEGEND,
  MAGIC,
  QUANTITIES,
  ROLLS,
  SOCKETS,
  STATUSES,
  SYSTEM,
  MIGRATIONS,
  WORKFLOWS,
  TOKEN
};

// Namespace Configuration Values
const ED4E = {
  // Need to write this out explicitly since the imported module namespaces are
  // exotic objects, meaning their prototype is null. This make Foundry's mergeObject
  // function not work as expected since it checks if objects are instanceof Object.
  ACTIONS:       {...ACTIONS},
  ACTORS:        {...ACTORS},
  CHAT:          {...CHAT},
  COMBAT:        {...COMBAT},
  DOCUMENT_DATA: {...DOCUMENT_DATA},
  EFFECTS:       {...EFFECTS},
  ENVIRONMENT:   {...ENVIRONMENT},
  ITEMS:         {...ITEMS},
  LEGEND:        {...LEGEND},
  MAGIC:         {...MAGIC},
  QUANTITIES:    {...QUANTITIES},
  ROLLS:         {...ROLLS},
  SOCKETS:       {...SOCKETS},
  STATUSES:      {...STATUSES},
  SYSTEM:        {...SYSTEM},
  MIGRATIONS:    {...MIGRATIONS},
  WORKFLOWS:     {...WORKFLOWS},
  TOKEN:         {...TOKEN},
  ...ACTIONS,
  ...ACTORS,
  ...CHAT,
  ...COMBAT,
  ...DOCUMENT_DATA,
  ...EFFECTS,
  ...ENVIRONMENT,
  ...ITEMS,
  ...LEGEND,
  ...MAGIC,
  ...QUANTITIES,
  ...ROLLS,
  ...SOCKETS,
  ...STATUSES,
  ...SYSTEM,
  ...MIGRATIONS,
  ...WORKFLOWS,
  ...TOKEN
};

/** @namespace ED4E */
export default ED4E;