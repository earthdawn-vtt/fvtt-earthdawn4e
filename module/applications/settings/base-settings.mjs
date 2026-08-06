import ApplicationEd from "../api/application.mjs";
import { getSetting, getSettingConfig, setSetting } from "../../helpers/settings.mjs";
import PromptFactory from "../global/prompt-factory.mjs";
import { SYSTEM_ID } from "../../constants/constants.mjs";

/**
 * Base class for custom ed4e settings applications, the sub-menus in the Earthdawn settings menu.
 */
export default class BaseSettingsConfig extends ApplicationEd {

  // region Static Properties

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    form: {
      closeOnSubmit: true,
      handler:       BaseSettingsConfig.#onCommitChanges,
    },
    position: {
      width: "auto",
    },
    settingsGroup: undefined,
  };

  static PARTS = {
    config: {
      template: "systems/ed4e/templates/settings/base-settings-config.hbs",
    },
    footer: {
      template: "systems/ed4e/templates/global/form-footer.hbs",
    }
  };

  // endregion

  // region Rendering

  /** @inheritdoc */
  async _preparePartContext ( partId, context, options ) {
    const newContext = await super._preparePartContext( partId, context, options );

    switch ( partId ) {
      case "config":
        newContext.fields = this._generateFieldEntries();
        break;
      case "footer":
        newContext.buttons = [
          PromptFactory.saveChangesButton,
        ];
    }

    return newContext;
  }

  /**
   * Builds a list of form fields for automatic rendering in the settings UI.
   *
   * Dynamically generated from the selected settings group, if any.
   *
   * @returns {Array<Object>} An array of field entry objects with `field` (field type),
   *                          `value` (current setting value), and `localize` (true) properties.
   *                          Returns an empty array if no settings group is configured.
   */
  _generateFieldEntries() {
    if ( !this.options.settingsGroup ) return [];

    return [ ...game.settings.settings.values() ].filter(
      settingConfig =>
        settingConfig.namespace === SYSTEM_ID
        && settingConfig.group === this.options.settingsGroup
    ).map( settingConfig => {
      return {
        field:    settingConfig.type,
        value:    getSetting( settingConfig.key ),
        localize: true,
      };
    } );
  }

  // endregion

  // region Form Handling

  /**
   * Saves changes to settings and reloads the client if necessary.
   * @type {ApplicationClickAction}
   */
  static async #onCommitChanges( event, form, formData, submitOptions ) {
    let requiresClientReload = false;
    let requiresWorldReload = false;

    const submitData = this._processSubmitData( event, form, formData, submitOptions );

    for ( const [ settingKey, settingValue ] of Object.entries( submitData[ SYSTEM_ID ] ?? {} ) ) {
      const settingConfig = getSettingConfig( settingKey );
      const oldValue = getSetting( settingKey );
      const newValue = await setSetting( settingKey, settingValue );

      // Simple equality is enough for current reload-tracked settings.
      // Complex settings are still saved correctly; this only affects whether a reload prompt is shown.
      if ( oldValue === newValue ) continue;

      requiresClientReload ||= ( settingConfig.scope !== "world" ) && settingConfig.requiresReload;
      requiresWorldReload ||= ( settingConfig.scope === "world" ) && settingConfig.requiresReload;
    }

    if ( requiresClientReload || requiresWorldReload )
      return foundry.applications.settings.SettingsConfig.reloadConfirm( { world: requiresWorldReload } );
  }

  // endregion

}