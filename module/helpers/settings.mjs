import * as SYSTEM from "../config/system.mjs";
import { SYSTEM_ID } from "../constants/constants.mjs";


// region Helpers

/**
 * Get an ed4e setting from the system settings.
 * @param {string} settingKey   The key of the setting to get.
 * @returns {*}                 The value of the setting.
 */
export function getSetting( settingKey ) {
  return game.settings.get( SYSTEM_ID, settingKey );
}

/**
 * Set an ed4e setting in the system settings
 * @param {string} settingKey  The key of the setting to set.
 * @param {*} value            The value to set the setting to.
 * @param {object} [options]   Any additional options to pass to the setting.
 *                             See {@link https://foundryvtt.com/api/classes/client.ClientSettings.html#set}
 * @returns {*}                The assigned value of the setting.
 */
export async function setSetting( settingKey, value, options={} ) {
  return game.settings.set( SYSTEM_ID, settingKey, value, options );
}

/**
 * Gets the setting config for a given setting key.
 * @param {string} settingKey The key of the setting in the system's namespace.
 * @returns {SettingConfig} The setting configuration object.
 */
export function getSettingConfig( settingKey ) {
  return game.settings.settings.get( `${ SYSTEM_ID }.${ settingKey }` );
}

/**
 * Get all available ed-ids from the system settings.
 * @returns {string[]} - A list of all available ed-ids.
 */
export function getEdIds() {
  return Object.keys(
    SYSTEM.defaultEdIds
  ).map(
    edid => getDefaultEdid( edid )
  );
}

/**
 * Get the default edid from settings for a given key.
 * @param {string} defaultKey - The key of the default edid to retrieve, as defined in {@link SYSTEM.defaultEdIds}.
 * @returns {string} The default edid associated with the provided key.
 */
export function getDefaultEdid( defaultKey ) {
  return getSetting(
    getEdidSettingKey( defaultKey )
  );
}

/**
 * Generates a formatted EDID setting key based on the provided EDID name.
 * @param {string} edidName - The name of the EDID to be formatted into a key.
 * @returns {string} The formatted EDID setting key.
 */
export function getEdidSettingKey( edidName ) {
  return `edid${ edidName.capitalize() }`;
}

// endregion