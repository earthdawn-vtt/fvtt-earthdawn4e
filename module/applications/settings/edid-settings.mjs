import BaseSettingsConfig from "./base-settings.mjs";

/**
 * Application for configuring ED-ID-related settings.
 * @augments {BaseSettingsConfig}
 */
export default class EdidSettingsConfig extends BaseSettingsConfig {

  // region Static Properties
  static DEFAULT_OPTIONS = {
    settingsGroup: "edid",
  };

}