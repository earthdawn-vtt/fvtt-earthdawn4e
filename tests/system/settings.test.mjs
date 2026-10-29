import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import english from "../../lang/en.json";
import german from "../../lang/de.json";

// Isolate settings registration from Foundry's rendering and data-model runtime.
vi.mock( "../../module/applications/settings/game-mechanics-settings.mjs", () => ( { default: {} } ) );
vi.mock( "../../module/applications/settings/edid-settings.mjs", () => ( { default: {} } ) );
vi.mock( "../../module/applications/settings/character-generation-settings.mjs", () => ( { default: {} } ) );
vi.mock( "../../module/applications/settings/lp-tracking-settings.mjs", () => ( { default: {} } ) );
vi.mock( "../../module/data/fields/edid-field.mjs", () => ( { default: Object } ) );
vi.mock( "../../module/config/system.mjs", () => ( { icons: {}, defaultEdIds: {} } ) );
vi.mock( "../../module/config/legend.mjs", () => ( {
  attributeIncreaseRules: {}, circleTalentRequirements: {}, spellCostRules: {}
} ) );
vi.mock( "../../module/config/rolls.mjs", () => ( { stepTables: {} } ) );
vi.mock( "../../module/config/magic.mjs", () => ( { spellcastingTypes: {} } ) );
vi.mock( "../../module/config/chat.mjs", () => ( { chatAvatarSettings: {} } ) );
vi.mock( "../../module/helpers/settings.mjs", () => ( { getEdidSettingKey: name => name } ) );
vi.mock( "../../module/i18n/localization.mjs", () => ( { preLocalize: vi.fn() } ) );

/** A minimal field double which retains the declared default for inspection. */
class Field {
  /** @param {...object} args Field arguments, with options last. */
  constructor( ...args ) {
    this.options = args.at( -1 ) ?? {};
  }

  /** @returns {*} The evaluated initial value, following the DataField contract. */
  getInitialValue() {
    const initial = this.options.initial;
    return typeof initial === "function" ? initial( {} ) : initial;
  }
}

describe( "Language setting defaults", () => {
  afterEach( () => vi.unstubAllGlobals() );

  beforeEach( () => {
    vi.resetModules();
    vi.stubGlobal( "foundry", {
      data: { fields: { BooleanField: Field, NumberField: Field, SetField: Field, StringField: Field } }
    } );
    vi.stubGlobal( "game", { settings: { register: vi.fn(), registerMenu: vi.fn() } } );
  } );

  it.each( [ [ "English", english ], [ "German", german ] ] )(
    "uses translated %s names when configuration is localized after module import",
    async ( language, translations ) => {
      const { default: registerSystemSettings } = await import( "../../module/system/settings.mjs" );
      const { languages } = await import( "../../module/config/actors.mjs" );

      // Settings are declared before i18nInit mutates the shared configuration.
      expect( languages.dwarf ).to.equal( "ED.Languages.dwarf" );
      Object.assign( languages, translations.ED.Languages );
      registerSystemSettings();

      const [ , , setting ] = game.settings.register.mock.calls.find( ( [ , key ] ) => key === "languages" );
      expect( setting.type.getInitialValue() ).to.deep.equal( Object.values( translations.ED.Languages ) );

      // Editing one initial list must not change the defaults of another world.
      setting.type.getInitialValue().push( "Custom language" );
      expect( setting.type.getInitialValue() ).to.deep.equal( Object.values( translations.ED.Languages ) );
    }
  );
} );
