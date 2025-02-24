import { preLocalize } from "../utils.mjs";


/**
 * Damage type
 * @enum {string}
 */
export const damageType = {
  standard:   "ED.Config.Health.damageStandard",
  stun:       "ED.Config.Health.damageStun",
};
preLocalize( "damageType" );

/**
 * Damage resistances
 * @enum {string}
 */
export const resistances = {
  fire:       "ED.Config.Resistances.fire",
};
preLocalize( "resistances" );

/**
 * Damage vulnerabilities
 * @enum {string}
 */
export const vulnerabilities = {
  fire:       "ED.Config.Vulnerabilities.fire",
};
preLocalize( "vulnerabilities" );