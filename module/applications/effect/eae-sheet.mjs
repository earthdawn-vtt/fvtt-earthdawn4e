const { ActiveEffectConfig } = foundry.applications.sheets;

/**
 * Extend the basic ActiveEffectConfig class to add Earthdawn game system specific modifications
 * @augments {ActiveEffectConfig}
 */
export default class EarthdawnActiveEffectSheet extends ActiveEffectConfig {

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    form: {
      submitOnChange: true,
      closeOnSubmit:  false,
    },
  };

  /** @inheritDoc */
  static PARTS = {
    ...ActiveEffectConfig.PARTS,
    details:  { template: "systems/ed4e/templates/effect/details.hbs" },
    duration: { template: "systems/ed4e/templates/effect/duration.hbs" },
  };

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  async _prepareContext( options ) {
    const context = await super._prepareContext( options );
    context.systemFields = this.document.system.schema.fields;
    return context;
  }

}