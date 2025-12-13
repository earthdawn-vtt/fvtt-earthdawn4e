import * as actor from "./actor/_module.mjs";
import * as item from "./item/_module.mjs";

/**
 * Registry for all document type migrations classes
 * @type {{string: { string: typeof BaseMigration }}}
 */
export const typeMigrationRegistry = {
  "actor": actor.typeMigrationConfig,
  "item":  item.typeMigrationConfig,
};

export {
  actor,
  item,
};
