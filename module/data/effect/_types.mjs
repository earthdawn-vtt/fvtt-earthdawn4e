/**
 * @import { STATUS_CONDITIONS } from "../../config/statuses.mjs";
 */

// region Active Effect Change

/**
 * The system data model for {@link EarthdawnActiveEffectChangeData}, a single change entry on an
 * {@link EarthdawnActiveEffect}.
 * @typedef EarthdawnActiveEffectChangeSystemData
 * @property {string} key The document field path targeted by this change.
 * @property {"add"|"multiply"|"override"|"upgrade"|"downgrade"|"custom"} type The change mode
 * (validated against Foundry's active-effect change modes).
 * @property {string|null} value The formula/value applied by this change. Supports roll formulas
 * via {@link FormulaField}.
 * @property {string} phase The application phase of the change (e.g. `"initial"`, `"derived"`,
 * `"final"`), controlling when it is applied during data preparation.
 * @property {number} [priority] Optional priority used to order changes within the same phase.
 */

// endregion

// region Active Effect

/**
 * The system data model for {@link EarthdawnActiveEffectData}, the base Earthdawn system-specific
 * active effect. Defines no schema fields itself; concrete subclasses extend it and declare their
 * own schema.
 * @typedef {object} EarthdawnActiveEffectSystemData
 */

// endregion

// region Condition Effect

/**
 * Additional data for {@link EarthdawnConditionEffectData}, on top of the base active effect data.
 * @typedef _EarthdawnConditionEffectData
 * {@ignore}
 * @property {keyof typeof STATUS_CONDITIONS} primary The primary status condition id represented by this effect.
 * @property {number|null} level The current level/stage of the status condition. `null` for
 * conditions without levels.
 */

/**
 * The system data model for {@link EarthdawnConditionEffectData}, an active effect representing
 * an Earthdawn status condition (optionally with stacked or staged levels).
 * @typedef {EarthdawnActiveEffectSystemData & _EarthdawnConditionEffectData} EarthdawnConditionEffectSystemData
 */

// endregion

