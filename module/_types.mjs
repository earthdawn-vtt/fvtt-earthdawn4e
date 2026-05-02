/**
 * @typedef {Record<string, number>} RollModifiers
 * @description A collection of named modifiers applied to rolls.
 * Keys are localized labels describing the source of the modifier (e.g., "Wounds", "Karma Bonus").
 * Values are numeric modifier values that will be applied to the roll (positive for bonuses, negative for penalties).
 * @example
 * // Example RollModifiers object:
 * {
 *   "Wounds": -2,
 *   "Talent Bonus": 3,
 *   "Situational Penalty": -1
 * }
 */

/**
 * @typedef {object} ModifierRecord
 * @description A single modifier applied to a roll.
 * @property {string} label The localized label describing the source of the modifier.
 * @property {number} modifier The numeric modifier value that will be applied to the roll.
 * @example
 * // Example ModifierRecord object:
 * {
 *   label: "Wounds",
 *   modifier: -2
 * }
 */

/**
 * @typedef { object } RollStepData
 * @description Data for a roll step.
 * @property { number } base The base step that is used to determine the dice that are rolled.
 * @property { RollModifiers } [modifiers] All modifiers that are applied to the base step.
 * @property { number } [total] The final step that is used to determine the dice that are rolled.
 *                            The sum of all modifiers is added to the base value.
 */

/**
 * @typedef { object } RollResourceData
 * @description Data for a roll resource like karma or devotion.
 * @property { number } pointsUsed How many points of this resource should be consumed after rolling.
 * @property { number } available How many points of this resource are available.
 * @property { number } step The step that is used to determine the dice that are rolled for this resource.
 * @property { string } dice The dice that are rolled for this resource.
 */

/**
 * @typedef { object } RollTargetData
 * @description Data for the target number of a roll.
 * @property { number } base The base target number.
 * @property { RollModifiers } [modifiers] All modifiers that are applied to the base target number.
 * @property { number } [total] The final target number. The sum of all modifiers is added to the base value.
 * @property { boolean } [public] Whether the target number is shown in chat or hidden.
 */

/**
 * @typedef { object } RollStrainData
 * @description Data for the strain that is taken after a roll.
 * @property { number } base The base strain that is taken.
 * @property { RollModifiers } [modifiers] All modifiers that are applied to the base strain.
 * @property { number } [total] The final strain that is taken. The sum of all modifiers is added to the base value.
 */

/**
 * @typedef {object} WorkflowOptions
 * @property {string} [name] The name of the workflow.
 */

export {};
