import FormulaField from "../../data/fields/formula-field.mjs";

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
    actions: {
      addChange:     this.#onAddChange,
      deleteChange:  this.#onDeleteChange,
    },
  };

  /** @inheritDoc */
  static PARTS = {
    ...ActiveEffectConfig.PARTS,
    details:  { template: "systems/ed4e/templates/effect/details.hbs" },
    duration: { template: "systems/ed4e/templates/effect/duration.hbs" },
    changes:  { template: "systems/ed4e/templates/effect/changes.hbs" },
  };

  /* -------------------------------------------- */
  /*  Form Handling                               */
  /* -------------------------------------------- */

  /** @inheritDoc */
  _prepareSubmitData( event, form, formData ) {
    const submitData = super._prepareSubmitData( event, form, formData );
    submitData.duration = submitData.system.duration;
    // submitData.changes = this._prepareChangesSubmitData( submitData.system.changes );
    return submitData;
  }

  _prepareChangesSubmitData( changes ) {
    return changes.map( change => {
      return {
        ...change,
        value: FormulaField.evaluate( change.value, this.document.system.formulaData, { warn: true } ),
      };
    } );
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  async _prepareContext( options ) {
    const context = await super._prepareContext( options );

    context.systemFields = this.document.system.schema.fields;

    // filter out submit button
    context.buttons = context.buttons.filter( b => b.type !== "submit" );

    return context;
  }

  /** @inheritDoc */
  async _preparePartContext( partId, context ) {
    const partContext = super._preparePartContext( partId, context );

    switch ( partId ) {
      case "details":
        break;
      case "duration":
        break;
      case "changes":
        partContext.keyOptions = this.document.parent?.constructor.EAE_SELECT_OPTIONS;
        break;
    }
  }

  /* -------------------------------------------- */
  /*  Handlers                                    */
  /* -------------------------------------------- */

  /**
   * Add a new change to the effect's changes array.
   * @this {ActiveEffectConfig}
   * @type {ApplicationClickAction}
   */
  static async #onAddChange() {
    const submitData = this._processFormData( null, this.form, new FormDataExtended( this.form ) );
    const systemChanges = Object.values( submitData.system.changes ) ?? [];
    systemChanges.push( {} );
    return this.submit( { updateData: { "system.changes": systemChanges } } );
  }

  /**
   * Delete a change from the effect's changes array.
   * @this {ActiveEffectConfig}
   * @type {ApplicationClickAction}
   */
  static async #onDeleteChange( event ) {}

}