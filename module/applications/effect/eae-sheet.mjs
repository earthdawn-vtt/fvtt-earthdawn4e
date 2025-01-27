const { ActiveEffectConfig } = foundry.applications.sheets;

/**
 * Extend the basic ActiveEffectConfig class to add Earthdawn game system specific modifications
 * @augments {ActiveEffectConfig}
 */
export default class EarthdawnActiveEffectSheet extends ActiveEffectConfig {

  // do some fancy stuff here

  /** @inheritDoc */
  static PARTS = {
    ...ActiveEffectConfig.PARTS,
    details: { template: "systems/ed4e/templates/effect/details.hbs" },
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