/**
 * @typedef ValueProperty
 * @property {number} value The current value of the property
 */

/**
 * @typedef _BaseValueProperty
 * {@ignore}
 * @property {number} baseValue The unmodified base value of the property
 */

/**
 * @typedef {_BaseValueProperty & ValueProperty} BaseValueProperty
 * {@interface}
 */

/**
 * @typedef _ValuePropertyWithMax
 * {@ignore}
 * @property {number} max The maximum value of the property
 */

/**
 * @typedef {_ValuePropertyWithMax & ValueProperty} ValuePropertyWithMax
 * {@interface}
 */

/**
 * @typedef _StepProperty
 * {@ignore}
 * @property {number} step A step to roll dice
 */

/**
 * @typedef {_StepProperty} StepProperty
 * {@interface}
 */

/**
 * @typedef {ValuePropertyWithMax & StepProperty} StepMaxValueProperty
 * {@interface}
 */

/**
 * @typedef DescriptionData
 * @property {string} value A description for the entity as an HTML string.
 */