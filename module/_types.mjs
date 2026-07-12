/**
 * A collection of named modifiers applied to rolls.
 * Keys are localized labels describing the source of the modifier (e.g., "Wounds", "Karma Bonus").
 * Values are numeric modifier values that will be applied to the roll (positive for bonuses, negative for penalties).
 * @typedef {Record<string, number>} RollModifiers
 * @example
 * // Example RollModifiers object:
 * {
 *   "Wounds": -2,
 *   "Talent Bonus": 3,
 *   "Situational Penalty": -1
 * }
 */

/**
 * A single modifier applied to a roll.
 * @typedef {object} ModifierRecord
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
 * Data for a roll step.
 * @typedef { object } RollStepData
 * @property { number } base The base step that is used to determine the dice that are rolled.
 * @property { RollModifiers } [modifiers] All modifiers that are applied to the base step.
 * @property { number } [total] The final step that is used to determine the dice that are rolled.
 *                            The sum of all modifiers is added to the base value.
 */

/**
 * Data for a roll resource like karma or devotion.
 * @typedef { object } RollResourceData
 * @property { number } pointsUsed How many points of this resource should be consumed after rolling.
 * @property { number } available How many points of this resource are available.
 * @property { number } step The step that is used to determine the dice that are rolled for this resource.
 * @property { string } dice The dice that are rolled for this resource.
 */

/**
 * Data for the target number of a roll.
 * @typedef { object } RollTargetData
 * @property { number } base The base target number.
 * @property { RollModifiers } [modifiers] All modifiers that are applied to the base target number.
 * @property { number } [total] The final target number. The sum of all modifiers is added to the base value.
 * @property { boolean } [public] Whether the target number is shown in chat or hidden.
 */

/**
 * Data for the strain that is taken after a roll.
 * @typedef { object } RollStrainData
 * @property { number } base The base strain that is taken.
 * @property { RollModifiers } [modifiers] All modifiers that are applied to the base strain.
 * @property { number } [total] The final strain that is taken. The sum of all modifiers is added to the base value.
 */

/**
 * @typedef {"attribute"|"halfMagic"|"substitute"} AttributeBasedRollType
 * Roll types that are based on an attribute step. One of the keys in {@link rollTypes}.
 */

/**
 * @typedef {object} WorkflowOptions
 * @property {string} [name] The name of the workflow.
 */

/**
 * A string representing an identifier, consisting of only ascii letters, numbers, _, and -.
 * @typedef {string} Identifier
 * @see{@link IdentifierField}
 */

/**
 * A 16-character UID
 * @typedef {string} DocumentId
 * @see{foundry.data.validation.isValidId}
 */

/**
 * A multipart Foundry UUID for identifying a document.
 * @typedef {string} DocumentUuid
 * @see{foundry.utils.parseUuid}
 */

/**
 * A special case string field that represents a strictly slugged string for identifying a document within
 * the Earthdawn system.
 * @typedef {string} EdId
 * @see{import("./data/fields/edid-field.mjs").EdIdField}
 */