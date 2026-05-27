import ApplicationEd from "../api/application.mjs";
import { getSetting, getSettingConfig, groupedSystemSettings, setSetting } from "../../helpers/settings.mjs";
import PromptFactory from "../global/prompt-factory.mjs";

export default class BaseSettingsConfig extends ApplicationEd {

  // region Static Properties

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    form: {
      closeOnSubmit: true,
      handler:       BaseSettingsConfig.#onCommitChanges,
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
        newContext.category = {
          fields: this._generateFieldEntries(),
        };
        break;
      case "footer":
        newContext.buttons = [
          PromptFactory.saveChangesButton,
        ];
    }

    return newContext;
  }

  _generateFieldEntries() {
    return groupedSystemSettings[ this.options.settingsGroup ]?.map(
      settingConfig => settingConfig.type
    );
  }

  // endregion

  // region Form Handling

  static async #onCommitChanges( event, form, formData, submitOptions ) {
    let requiresClientReload = false;
    let requiresWorldReload = false;

    for ( const [ settingKey, settingValue ] of Object.entries(
      this._processSubmitData( event, form, formData, submitOptions )
    ) ) {
      const settingConfig = getSettingConfig( settingKey );
      const oldValue = getSetting( settingKey );
      const newValue = await setSetting( settingKey, settingValue );

      if ( oldValue === newValue ) continue;

      requiresClientReload ||= ( settingConfig.scope !== "world" ) && settingConfig.requiresReload;
      requiresWorldReload ||= ( settingConfig.scope === "world" ) && settingConfig.requiresReload;
    }

    if ( requiresClientReload || requiresWorldReload )
      return foundry.applications.settings.SettingsConfig.reloadConfirm( { world: requiresWorldReload } );
  }

  // endregion

}