import BaseSettingsConfig from "./base-settings.mjs";

/**
 * Application for configuring game mechanics settings.
 * @augments {BaseSettingsConfig}
 */
export default class GameMechanicsSettingsConfig extends BaseSettingsConfig {

  // region Static Properties
  static DEFAULT_OPTIONS = {
    settingsGroup: "gameMechanics",
  };

}