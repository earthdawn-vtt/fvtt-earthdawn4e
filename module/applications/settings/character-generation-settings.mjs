import BaseSettingsConfig from "./base-settings.mjs";

/**
 * Application for configuring character generation settings.
 * @augments {BaseSettingsConfig}
 */
export default class CharacterGenerationSettingsConfig extends BaseSettingsConfig {

  // region Static Properties
  static DEFAULT_OPTIONS = {
    settingsGroup: "characterGeneration",
  };

}