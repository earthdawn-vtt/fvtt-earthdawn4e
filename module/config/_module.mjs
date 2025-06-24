import * as ACTIONS from "./actions.mjs";
import * as ACTORS from "./actors.mjs";
import * as CHAT from "./chat.mjs";
import * as COMBAT from "./combat.mjs";
import * as DOCUMENT_DATA from "./document-data.mjs";
import * as EFFECTS from "./effects.mjs";
import * as ITEMS from "./items.mjs";
import * as LEGEND from "./legend.mjs";
import * as MAGIC from "./magic.mjs";
import * as QUANTITIES from "./quantities.mjs";
import * as ROLLS from "./rolls.mjs";
import * as SOCKETS from "./sockets.mjs";
import * as STATUSES from "./statuses.mjs";
import * as SYSTEM from "./system.mjs";
import * as MIGRATIONS from "./migrations.mjs";
import * as WORKFLOWS from "./workflows.mjs";


/* -------------------------------------------- */
/*  Enable .hbs Hot Reload                      */
/* -------------------------------------------- */

/* eslint-disable */
// Since Foundry does not support hot reloading object notation templates...
Hooks.on('hotReload', async ({ content, extension, packageId, packageType, path } = {}) => {
  if (extension === 'hbs') {
    const key = Object.entries(flattenObject(templates)).find(([_, templatePath]) => templatePath == path)?.[0];
    if (!key) throw new Error(`Unrecognized template: ${path}`);
    await new Promise((resolve, reject) => {
      game.socket.emit('template', path, resp => {
        if (resp.error) return reject(new Error(resp.error));
        const compiled = Handlebars.compile(resp.html);
        Handlebars.registerPartial(generateTemplateKey(key), compiled);
        console.log(`Foundry VTT | Retrieved and compiled template ${path} as ${key}`);
        resolve(compiled);
      });
    });
    Object.values(ui.windows).forEach(app => app.render(true));
  }
});
/* eslint-enable */

export {
  ACTIONS,
  ACTORS,
  CHAT,
  COMBAT,
  DOCUMENT_DATA,
  EFFECTS,
  ITEMS,
  LEGEND,
  MAGIC,
  QUANTITIES,
  ROLLS,
  SOCKETS,
  STATUSES,
  SYSTEM,
  MIGRATIONS,
  WORKFLOWS
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
  ...ACTIONS,
  ...ACTORS,
  ...CHAT,
  ...COMBAT,
  ...DOCUMENT_DATA,
  ...EFFECTS,
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
};

export default ED4E;