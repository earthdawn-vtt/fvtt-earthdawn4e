import BaseSettingsConfig from "./base-settings.mjs";

/**
 * Application for configuring LP Tracking settings.
 * @augments {BaseSettingsConfig}
 */
export default class LpTrackingSettingsConfig extends BaseSettingsConfig {

  // region Static Properties
  static DEFAULT_OPTIONS = {
    settingsGroup: "lpTracking",
  };

}