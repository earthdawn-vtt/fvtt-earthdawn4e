import { MAGIC, SYSTEM } from "../../config/_module.mjs";

export default class SceneConfigEd extends foundry.applications.sheets.SceneConfig {

  static PARTS = {
    tabs:      { ...super.PARTS.tabs },
    basics:    { ...super.PARTS.basics },
    grid:      { ...super.PARTS.grid },
    lighting:  { ...super.PARTS.lighting },
    ambience:  { ...super.PARTS.ambience },
    earthdawn: { template: "systems/ed4e/templates/configs/scene-config-tab-ed.hbs" },
    footer:    { ...super.PARTS.footer },
  };

  /** @override */
  static TABS = {
    ...super.TABS,
    sheet: {
      ...super.TABS.sheet,
      tabs: [
        ...super.TABS.sheet.tabs,
        { id: "earthdawn", icon: `fa-solid ${SYSTEM.icons.earthdawn}`, label: "ED.Tabs.Scene.earthdawn" },
      ],
    },
  };

  /** @override */
  async _onRender( context, options ) {
    await super._onRender( context, options );
    this._addAstralPollutionToScene( context, options );
  }

  /**
   * Adds a select input for astral pollution to the scene config.
   */
  _addAstralPollutionToScene() {
    const SYSTEM_ID = game?.system?.id ?? "ed4e";
    const fields = foundry.applications.fields;

    /** @type {Scene} */
    const scene = this.document;

    const selectOptions = Object.entries(
      MAGIC.astralSpacePollution
    ).map(
      entry => {
        const key = entry[0];
        const value = entry[1];
        return {
          value:    key,
          label:    value.label,
        };
      }
    );

    const input = fields.createSelectInput( {
      name:    `flags.${SYSTEM_ID}.astralPollution`,
      value:   scene.getFlag( SYSTEM_ID, "astralPollution" ),
      options: selectOptions,
    } );

    const group = fields.createFormGroup( {
      input,
      label:    "ED.Scene.AstralPollution.label",
      hint:     "ED.Scene.AstralPollution.hint",
      localize: true,
    } );
    
    const edOptions = this.element.querySelector( ".tab[data-group=\"sheet\"][data-tab=\"earthdawn\"]" );

    edOptions.append( group );
    this.setPosition();
  }
}