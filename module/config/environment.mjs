/**
 * @typedef {object} FallingDamageData
 * @property {number} min The minimum distance in yards for this damage range.
 * @property {number} max The maximum distance in yards for this damage range.
 * @property {number} damageStep The base damage step for this distance range.
 * @property {number} numberOfRolls The number of rolls to make for this distance range.
 */

/**
 * Falling damage data for different distance ranges.
 * The damage is calculated based on the distance fallen in yards.
 * @type {{table: [FallingDamageData], lookup: (distance: number) => FallingDamageData|null}}
 */
export const fallingDamage = {
  table: [
    { min: 2,   max: 3,        damageStep: 5,  numberOfRolls: 1 },
    { min: 4,   max: 6,        damageStep: 10, numberOfRolls: 1 },
    { min: 7,   max: 10,       damageStep: 15, numberOfRolls: 1 },
    { min: 11,  max: 20,       damageStep: 20, numberOfRolls: 2 },
    { min: 21,  max: 30,       damageStep: 25, numberOfRolls: 2 },
    { min: 31,  max: 50,       damageStep: 25, numberOfRolls: 3 },
    { min: 51,  max: 100,      damageStep: 30, numberOfRolls: 3 },
    { min: 101, max: 150,      damageStep: 30, numberOfRolls: 4 },
    { min: 151, max: 200,      damageStep: 35, numberOfRolls: 4 },
    { min: 201, max: Infinity, damageStep: 35, numberOfRolls: 5 },
  ],
  /**
   * Looks up the falling damage data for a given distance.
   * @param {number} distance The distance fallen in yards.
   * @returns {FallingDamageData|null} The falling damage data for the distance, or null if not found.
   */
  lookup( distance ) {
    return this.table.find( range => distance >= range.min && distance <= range.max ) || null;
  }
};

/**
 * @typedef {object} FireDamageData
 * @property {string} label The localized label for the fire source.
 * @property {number} damageStep The base damage step for this fire source.
 * @property {boolean} touch Whether the fire source needs to be touched to cause damage.
 */

/**
 * Fire damage data for different fire sources.
 * @enum {FireDamageData}
 */
export const fireDamage = {
  torch: {
    label:       "ED.Config.FireDamage.torch",
    damageStep:  4,
    touch:       true,
  },
  campfireSmall: {
    label:       "ED.Config.FireDamage.campfireSmall",
    damageStep:  6,
    touch:       true,
  },
  campfireLarge: {
    label:       "ED.Config.FireDamage.campfireLarge",
    damageStep:  8,
    touch:       true,
  },
  houseFire: {
    label:       "ED.Config.FireDamage.houseFire",
    damageStep:  10,
    touch:       false,
  },
  forestFire: {
    label:       "ED.Config.FireDamage.forestFire",
    damageStep:  12,
    touch:       false,
  },
};