export default class CombatantConfigEd extends foundry.applications.sheets.CombatantConfig {

  /** @inheritDoc */
  static PARTS = {
    system: {
      root:      true,
      template:  "systems/ed4e/templates/combat/combatant-config.hbs",
    },
  };

  /** @inheritDoc */
  async _prepareContext( options={} ) {
    const context = await super._prepareContext( options );
    context.system = this.document.system;
    context.systemFields = this.document.system.schema.fields;
    return context;
  }

}