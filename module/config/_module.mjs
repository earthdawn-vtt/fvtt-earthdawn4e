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

// Namespace Configuration Values
const ED4E = {
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
  ...MIGRATIONS
};

export default ED4E;